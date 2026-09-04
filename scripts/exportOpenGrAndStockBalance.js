/**
 * As-on-date snapshot of:
 *   1) Purchase-order line items with open GR balance (to-be-delivered material or service)
 *   2) Materials currently in stock (complete-stock and special-stock)
 *
 * Output: Excel workbook with a Header (metadata) sheet plus two data sheets.
 *
 * Usage (from repo root):
 *   node scripts/exportOpenGrAndStockBalance.js
 *   node scripts/exportOpenGrAndStockBalance.js --uri mongodb://127.0.0.1:27017 --db mmportal
 *   node scripts/exportOpenGrAndStockBalance.js --out exports/my-snapshot.xlsx
 *   node scripts/exportOpenGrAndStockBalance.js --min-pending-val 0
 *
 * Connection: MONGODB_URI and DB_NAME from .env.local / environment.
 * If the configured URI is unreachable, the script falls back to mongodb://127.0.0.1:27017.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017';
const CONNECT_TIMEOUT_MS = 8000;
const NUMERIC_CELL_FORMAT = '0.##########';

const PO_COLUMN_ORDER = [
  'po-number',
  'po-line-item',
  'po-date',
  'delivery-date',
  'vendorcode',
  'vendorname',
  'item-type',
  'material.matcode',
  'material.matdescription',
  'material.matgroup',
  'plant-code',
  'po-quantity',
  'po-unit-of-measure',
  'po-unit-price',
  'currency',
  'po-value-sar',
  'pending-qty',
  'pending-val-sar',
  'pending-inv-qty',
  'pending-inv-val',
  'account.wbs',
  'account.network',
  'account.network-activity',
  'account.order',
  'account.costcenter',
  'account.salesdoc',
  'account.salesdoc-item',
  '_id',
];

const STOCK_COLUMN_ORDER = [
  'stock-type',
  'material-code',
  'material-description',
  'mat-description2',
  'material-group',
  'plant-code',
  'unit-of-measure',
  'stk-indicator',
  'wbs-element',
  'sales-doc',
  'sales-doc-no',
  'current-stkqty',
  'current-stkval',
  'stock-qty',
  'stock-val',
  'receipt-qty',
  'receipt-val',
  'issue-qty',
  'issue-val',
  'stock-date',
  '_id',
];

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function parseArgs(argv) {
  const args = { uri: null, db: null, out: null, minPendingVal: 0 };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--uri' && next) {
      args.uri = next;
      i += 1;
    } else if (token === '--db' && next) {
      args.db = next;
      i += 1;
    } else if ((token === '--out' || token === '--output') && next) {
      args.out = next;
      i += 1;
    } else if (token === '--min-pending-val' && next) {
      args.minPendingVal = Number(next);
      i += 1;
    } else if (token === '--help' || token === '-h') {
      args.help = true;
    }
  }
  return args;
}

function printHelp() {
  console.log(`As-on-date open GR purchase orders and in-stock materials Excel export.

Usage:
  node scripts/exportOpenGrAndStockBalance.js [options]

Options:
  --uri <mongodb-uri>       Override MONGODB_URI
  --db <database-name>      Override DB_NAME (default: mmportal)
  --out <file.xlsx>         Output path (default: exports/open-gr-and-stock-balance_<timestamp>.xlsx)
  --min-pending-val <n>     Include PO lines with pending-val-sar > n (default: 0)
  -h, --help                Show this help
`);
}

function isPlainObject(value) {
  if (value == null || typeof value !== 'object') return false;
  if (Array.isArray(value) || value instanceof Date) return false;
  if (value._bsontype) return false;
  const name = value.constructor && value.constructor.name;
  return !name || name === 'Object';
}

function bsonToExcelValue(value) {
  if (value == null) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value;

  const bsonType = value._bsontype || (value.constructor && value.constructor.name);
  if (bsonType === 'Decimal128') {
    const asString = value.toString();
    const asNumber = Number(asString);
    return Number.isFinite(asNumber) ? asNumber : asString;
  }
  if (bsonType === 'ObjectId' || bsonType === 'ObjectID') {
    return String(value);
  }
  if (bsonType === 'Long' || bsonType === 'Int32' || bsonType === 'Double') {
    const n = typeof value.toNumber === 'function' ? value.toNumber() : Number(value);
    return Number.isFinite(n) ? n : String(value);
  }
  if (typeof value === 'object' && value.$numberDecimal != null) {
    const asNumber = Number(value.$numberDecimal);
    return Number.isFinite(asNumber) ? asNumber : String(value.$numberDecimal);
  }
  return value;
}

function flattenDoc(doc, prefix = '', out = {}) {
  if (!doc || typeof doc !== 'object') return out;
  for (const [key, value] of Object.entries(doc)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      flattenDoc(value, pathKey, out);
    } else if (Array.isArray(value)) {
      out[pathKey] = value
        .map((item) =>
          isPlainObject(item) ? JSON.stringify(flattenDoc(item)) : String(bsonToExcelValue(item))
        )
        .join('; ');
    } else {
      out[pathKey] = bsonToExcelValue(value);
    }
  }
  return out;
}

function orderedHeaders(rows, preferred) {
  const seen = new Set();
  const headers = [];
  for (const key of preferred) {
    if (!seen.has(key)) {
      headers.push(key);
      seen.add(key);
    }
  }
  const extra = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      extra.add(key);
    }
  }
  for (const key of [...extra].sort()) {
    if (!seen.has(key)) {
      headers.push(key);
      seen.add(key);
    }
  }
  return headers;
}

function toNumeric(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'object' && value._bsontype === 'Decimal128') {
    const n = Number(value.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundSar(value) {
  return Math.round((toNumeric(value) + Number.EPSILON) * 100) / 100;
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') +
    '_' +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join('-');
}

function formatDisplayDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplayTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function timezoneLabel(date) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tz = parts.find((p) => p.type === 'timeZoneName');
    const localName = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${localName}${tz ? ` (${tz.value})` : ''}`;
  } catch {
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `UTC${sign}${hh}:${mm}`;
  }
}

function hostFromUri(uri) {
  try {
    const cleaned = String(uri).replace(/^mongodb(\+srv)?:\/\//, 'http://');
    const parsed = new URL(cleaned);
    return parsed.host || '';
  } catch {
    return '';
  }
}

function classifyPoItem(flat) {
  const matcode = String(flat['material.matcode'] || '').trim();
  return matcode ? 'material' : 'service';
}

function setColumnWidths(worksheet, headers, sampleRows) {
  worksheet['!cols'] = headers.map((header) => {
    let maxLen = String(header).length;
    const scan = Math.min(sampleRows.length, 80);
    for (let i = 0; i < scan; i += 1) {
      const cell = sampleRows[i][header];
      if (cell == null || cell === '') continue;
      const text =
        cell instanceof Date
          ? 'yyyy-mm-dd hh:mm'
          : typeof cell === 'number'
            ? String(cell)
            : String(cell);
      if (text.length > maxLen) maxLen = text.length;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 12), 48) };
  });
}

function applyNumberFormats(worksheet) {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let r = range.s.r + 1; r <= range.e.r; r += 1) {
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[addr];
      if (cell && typeof cell.v === 'number' && cell.t === 'n' && !(cell.v instanceof Date)) {
        if (!cell.z) cell.z = NUMERIC_CELL_FORMAT;
      }
    }
  }
}

function sheetFromRows(rows, preferredOrder) {
  const headers = orderedHeaders(rows, preferredOrder);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: headers,
    cellDates: true,
    dateNF: 'yyyy-mm-dd',
  });
  setColumnWidths(worksheet, headers, rows);
  applyNumberFormats(worksheet);
  if (rows.length > 0) {
    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: rows.length, c: headers.length - 1 },
      }),
    };
  }
  return { worksheet, headers, rowCount: rows.length };
}

function uniqueStockDates(rows) {
  const dates = new Set();
  for (const row of rows) {
    const d = row['stock-date'];
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      dates.add(d.toISOString().slice(0, 10));
    }
  }
  return [...dates].sort();
}

function openPoFilter(minPendingVal) {
  return {
    $or: [
      { 'pending-val-sar': { $gt: minPendingVal } },
      { 'pending-qty': { $gt: 0 } },
    ],
  };
}

async function connectToMongo(uri, dbName) {
  const tryConnect = async (candidateUri) => {
    const client = new MongoClient(candidateUri, {
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
    });
    await client.connect();
    return { client, db: client.db(dbName), uriUsed: candidateUri };
  };

  try {
    return await tryConnect(uri);
  } catch (error) {
    const alreadyLocal =
      /127\.0\.0\.1|localhost/i.test(uri) || uri === LOCAL_FALLBACK_URI;
    if (alreadyLocal) throw error;
    console.warn(
      `Could not connect to ${hostFromUri(uri) || uri} (${error.message}). Trying ${LOCAL_FALLBACK_URI}...`
    );
    return tryConnect(LOCAL_FALLBACK_URI);
  }
}

async function loadMaterialLookup(db, materialCodes) {
  const lookup = new Map();
  if (!materialCodes.length) return lookup;
  const chunkSize = 1000;
  for (let i = 0; i < materialCodes.length; i += chunkSize) {
    const chunk = materialCodes.slice(i, i + chunkSize);
    const docs = await db
      .collection('materials')
      .find({ 'material-code': { $in: chunk } })
      .project({
        'material-code': 1,
        'material-description': 1,
        'mat-description2': 1,
        'material-group': 1,
      })
      .toArray();
    for (const doc of docs) {
      lookup.set(String(doc['material-code']), doc);
    }
  }
  return lookup;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const uri = args.uri || process.env.MONGODB_URI;
  const dbName = args.db || process.env.DB_NAME || 'mmportal';
  if (!uri) {
    console.error('Please set MONGODB_URI in .env.local or pass --uri.');
    process.exit(1);
  }

  const runAt = new Date();
  const defaultName = `open-gr-and-stock-balance_${formatTimestamp(runAt)}.xlsx`;
  const outPath = path.resolve(args.out || path.join(__dirname, '..', 'exports', defaultName));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const minPendingVal = Number.isFinite(args.minPendingVal) ? args.minPendingVal : 0;
  const { client, db, uriUsed } = await connectToMongo(uri, dbName);

  try {
    const poFilter = openPoFilter(minPendingVal);
    const completeFilter = {
      $or: [{ 'current-stkqty': { $gt: 0 } }, { 'current-stkval': { $gt: 0 } }],
    };
    const specialFilter = {
      $or: [{ 'stock-qty': { $gt: 0 } }, { 'stock-val': { $gt: 0 } }],
    };

    console.log('Fetching open GR purchase order lines...');
    const poDocs = await db
      .collection('purchaseorders')
      .find(poFilter)
      .sort({ 'po-number': 1, 'po-line-item': 1 })
      .toArray();

    console.log('Fetching complete-stock and special-stock balances...');
    const [completeDocs, specialDocs] = await Promise.all([
      db.collection('completestock').find(completeFilter).sort({ 'material-code': 1, 'plant-code': 1 }).toArray(),
      db.collection('specialstock').find(specialFilter).sort({ 'material-code': 1, 'plant-code': 1 }).toArray(),
    ]);

    const materialCodes = [
      ...new Set(
        [...completeDocs, ...specialDocs]
          .map((d) => d['material-code'])
          .filter((code) => code != null && String(code).trim() !== '')
          .map((code) => String(code))
      ),
    ];
    const materialLookup = await loadMaterialLookup(db, materialCodes);

    const poRows = poDocs.map((doc) => {
      const flat = flattenDoc(doc);
      flat['item-type'] = classifyPoItem(flat);
      return flat;
    });

    const enrichStock = (doc, stockType) => {
      const flat = flattenDoc(doc);
      const code = String(flat['material-code'] || '');
      const master = materialLookup.get(code);
      return {
        'stock-type': stockType,
        ...flat,
        'material-description': master?.['material-description'] || '',
        'mat-description2': master?.['mat-description2'] || '',
        'material-group': master?.['material-group'] || '',
      };
    };

    const stockRows = [
      ...completeDocs.map((doc) => enrichStock(doc, 'complete-stock')),
      ...specialDocs.map((doc) => enrichStock(doc, 'special-stock')),
    ];

    const totalPendingVal = roundSar(poRows.reduce((sum, row) => sum + toNumeric(row['pending-val-sar']), 0));
    const totalPendingQty = poRows.reduce((sum, row) => sum + toNumeric(row['pending-qty']), 0);
    const totalPoValue = roundSar(poRows.reduce((sum, row) => sum + toNumeric(row['po-value-sar']), 0));
    const completeStockVal = roundSar(completeDocs.reduce((sum, doc) => sum + toNumeric(doc['current-stkval']), 0));
    const specialStockVal = roundSar(specialDocs.reduce((sum, doc) => sum + toNumeric(doc['stock-val']), 0));
    const completeStockQty = completeDocs.reduce((sum, doc) => sum + toNumeric(doc['current-stkqty']), 0);
    const specialStockQty = specialDocs.reduce((sum, doc) => sum + toNumeric(doc['stock-qty']), 0);
    const uniquePoCount = new Set(poRows.map((row) => row['po-number']).filter(Boolean)).size;
    const stockDates = uniqueStockDates(stockRows);

    const headerAoA = [
      ['MM Portal — As-on-date Open GR PO and Stock Balance'],
      [],
      ['Field', 'Value'],
      ['Run date', formatDisplayDate(runAt)],
      ['Run time', formatDisplayTime(runAt)],
      ['Timezone', timezoneLabel(runAt)],
      ['ISO timestamp', runAt.toISOString()],
      ['As-on-date (script run)', formatDisplayDate(runAt)],
      [],
      ['Database', dbName],
      ['MongoDB host', hostFromUri(uriUsed) || uriUsed],
      ['Source collections', 'purchaseorders; completestock; specialstock'],
      ['PO filter', `pending-val-sar > ${minPendingVal} OR pending-qty > 0`],
      ['Stock filter', 'complete-stock: current-stkqty > 0 OR current-stkval > 0; special-stock: stock-qty > 0 OR stock-val > 0'],
      ['Stock snapshot date(s) in source data', stockDates.join(', ') || 'n/a'],
      [],
      ['Open PO unique PO numbers', uniquePoCount],
      ['Open PO line items', poRows.length],
      ['Open PO total PO value (SAR)', totalPoValue],
      ['Open PO total pending GR value (SAR)', totalPendingVal],
      ['Open PO total pending qty', totalPendingQty],
      ['Complete-stock rows', completeDocs.length],
      ['Complete-stock quantity', completeStockQty],
      ['Complete-stock value (SAR)', completeStockVal],
      ['Special-stock rows', specialDocs.length],
      ['Special-stock quantity', specialStockQty],
      ['Special-stock value (SAR)', specialStockVal],
      ['Open stock rows (combined)', stockRows.length],
      ['Open stock value combined (SAR)', completeStockVal + specialStockVal],
      [],
      ['Output file', outPath],
      ['Notes', 'PO sheet is purchaseorders line-item grain with all source fields flattened. Stock sheet combines complete-stock and special-stock; material description/group are looked up from materials. Numeric Decimal128 values are written at full source precision (not rounded).'],
    ];

    const headerSheet = XLSX.utils.aoa_to_sheet(headerAoA);
    headerSheet['!cols'] = [{ wch: 46 }, { wch: 90 }];
    if (headerSheet['A1']) {
      headerSheet['A1'].s = { font: { bold: true } };
    }

    const poSheet = sheetFromRows(poRows, PO_COLUMN_ORDER);
    const stockSheet = sheetFromRows(stockRows, STOCK_COLUMN_ORDER);

    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: 'Open GR PO and Stock Balance',
      Subject: 'As-on-date snapshot of undelivered PO GR balance and on-hand stock',
      CreatedDate: runAt,
    };
    XLSX.utils.book_append_sheet(workbook, headerSheet, 'Header');
    XLSX.utils.book_append_sheet(workbook, poSheet.worksheet, 'Open_PO_GR_Balance');
    XLSX.utils.book_append_sheet(workbook, stockSheet.worksheet, 'Open_Stock_Balance');

    XLSX.writeFile(workbook, outPath, { cellDates: true, compression: true });

    console.log(`Run at: ${runAt.toISOString()} (${timezoneLabel(runAt)})`);
    console.log(`Open PO lines: ${poRows.length} (${uniquePoCount} POs), pending GR SAR: ${totalPendingVal}`);
    console.log(`Complete-stock rows: ${completeDocs.length}, special-stock rows: ${specialDocs.length}`);
    console.log(`Excel: ${outPath}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
