/**
 * Shared as-on-date open GR PO and on-hand stock queries.
 * Used by API routes (and kept in sync with scripts/exportOpenGrAndStockBalance.js).
 */

export function toNumeric(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'object' && value._bsontype === 'Decimal128') {
    const n = Number(value.toString());
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value === 'object' && value.$numberDecimal != null) {
    const n = Number(value.$numberDecimal);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function bsonToJsonValue(value) {
  if (value == null) return '';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }
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

function isPlainObject(value) {
  if (value == null || typeof value !== 'object') return false;
  if (Array.isArray(value) || value instanceof Date) return false;
  if (value._bsontype) return false;
  const name = value.constructor && value.constructor.name;
  return !name || name === 'Object';
}

export function flattenDoc(doc, prefix = '', out = {}) {
  if (!doc || typeof doc !== 'object') return out;
  for (const [key, value] of Object.entries(doc)) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      flattenDoc(value, pathKey, out);
    } else if (Array.isArray(value)) {
      out[pathKey] = value
        .map((item) =>
          isPlainObject(item) ? JSON.stringify(flattenDoc(item)) : String(bsonToJsonValue(item))
        )
        .join('; ');
    } else {
      out[pathKey] = bsonToJsonValue(value);
    }
  }
  return out;
}

export function classifyPoItem(flat) {
  const matcode = String(flat['material.matcode'] || '').trim();
  return matcode ? 'material' : 'service';
}

export function openPoFilter(minPendingVal = 0) {
  return {
    $or: [
      { 'pending-val-sar': { $gt: minPendingVal } },
      { 'pending-qty': { $gt: 0 } },
    ],
  };
}

export const completeStockFilter = {
  $or: [{ 'current-stkqty': { $gt: 0 } }, { 'current-stkval': { $gt: 0 } }],
};

export const specialStockFilter = {
  $or: [{ 'stock-qty': { $gt: 0 } }, { 'stock-val': { $gt: 0 } }],
};

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

export async function fetchOpenPurchaseOrderLines(db, { minPendingVal = 0 } = {}) {
  const docs = await db
    .collection('purchaseorders')
    .find(openPoFilter(minPendingVal))
    .sort({ 'po-number': 1, 'po-line-item': 1 })
    .toArray();

  return docs.map((doc) => {
    const flat = flattenDoc(doc);
    flat['item-type'] = classifyPoItem(flat);
    return flat;
  });
}

export async function fetchOpenStockBalances(db) {
  const [completeDocs, specialDocs] = await Promise.all([
    db
      .collection('completestock')
      .find(completeStockFilter)
      .sort({ 'material-code': 1, 'plant-code': 1 })
      .toArray(),
    db
      .collection('specialstock')
      .find(specialStockFilter)
      .sort({ 'material-code': 1, 'plant-code': 1 })
      .toArray(),
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

  const enrich = (doc, stockType) => {
    const flat = flattenDoc(doc);
    const code = String(flat['material-code'] || '');
    const master = materialLookup.get(code);
    return {
      'stock-type': stockType,
      ...flat,
      'material-description': master?.['material-description'] || '',
      'mat-description2': master?.['mat-description2'] || '',
      'material-group': master?.['material-group'] || '',
      'on-hand-qty':
        stockType === 'complete-stock'
          ? toNumeric(flat['current-stkqty'])
          : toNumeric(flat['stock-qty']),
      'on-hand-val':
        stockType === 'complete-stock'
          ? toNumeric(flat['current-stkval'])
          : toNumeric(flat['stock-val']),
    };
  };

  return [
    ...completeDocs.map((doc) => enrich(doc, 'complete-stock')),
    ...specialDocs.map((doc) => enrich(doc, 'special-stock')),
  ];
}

export function summarizeOpenPoLines(rows) {
  const uniquePos = new Set(rows.map((row) => row['po-number']).filter(Boolean));
  return {
    lineCount: rows.length,
    poCount: uniquePos.size,
    pendingValueSar: rows.reduce((sum, row) => sum + toNumeric(row['pending-val-sar']), 0),
    pendingQty: rows.reduce((sum, row) => sum + toNumeric(row['pending-qty']), 0),
    poValueSar: rows.reduce((sum, row) => sum + toNumeric(row['po-value-sar']), 0),
  };
}

export function summarizeOpenStock(rows) {
  const complete = rows.filter((row) => row['stock-type'] === 'complete-stock');
  const special = rows.filter((row) => row['stock-type'] === 'special-stock');
  return {
    rowCount: rows.length,
    completeCount: complete.length,
    specialCount: special.length,
    completeValueSar: complete.reduce((sum, row) => sum + toNumeric(row['on-hand-val']), 0),
    specialValueSar: special.reduce((sum, row) => sum + toNumeric(row['on-hand-val']), 0),
    totalValueSar: rows.reduce((sum, row) => sum + toNumeric(row['on-hand-val']), 0),
  };
}
