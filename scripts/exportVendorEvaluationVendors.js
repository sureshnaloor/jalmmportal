/**
 * Export vendor code + vendor name for /vendor-evaluation-current-year list.
 * Uses the same PO aggregation filter as GET /api/vendors/annual-evaluation.
 *
 * Usage (from repo root):
 *   node scripts/exportVendorEvaluationVendors.js
 *
 * Output: public/vendor-evaluation-vendors.xlsx (+ .csv)
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const XLSX = require('xlsx');

const MIN_VENDOR_PO_VALUE_SAR = 10000;

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

function getVendorEvaluationYear(referenceDate = new Date()) {
  return referenceDate.getFullYear() - 1;
}

function getVendorEvaluationYearRange(year) {
  return {
    yearStart: new Date(year, 0, 1, 0, 0, 0, 0),
    yearEnd: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}

async function main() {
  loadEnvLocal();

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.DB_NAME;

  if (!MONGODB_URI || !MONGODB_DB) {
    console.error('Please set MONGODB_URI and DB_NAME in .env.local or environment.');
    process.exit(1);
  }

  const evaluationYear = getVendorEvaluationYear();
  const { yearStart, yearEnd } = getVendorEvaluationYearRange(evaluationYear);

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  try {
    const vendors = await db
      .collection('purchaseorders')
      .aggregate([
        {
          $match: {
            'po-date': { $gte: yearStart, $lte: yearEnd },
            vendorcode: { $exists: true, $nin: [null, ''] },
          },
        },
        {
          $group: {
            _id: '$vendorcode',
            vendorname: { $first: '$vendorname' },
            totalValue: { $sum: '$po-value-sar' },
          },
        },
        {
          $match: {
            totalValue: { $gt: MIN_VENDOR_PO_VALUE_SAR },
          },
        },
        {
          $project: {
            _id: 0,
            vendorcode: '$_id',
            vendorname: 1,
          },
        },
        { $sort: { vendorcode: 1 } },
      ])
      .toArray();

    const rows = vendors.map((v) => ({
      'Vendor Code': String(v.vendorcode ?? ''),
      'Vendor Name': String(v.vendorname ?? ''),
    }));

    const publicDir = path.join(__dirname, '..', 'public');
    const baseName = `vendor-evaluation-vendors-${evaluationYear}`;
    const xlsxPath = path.join(publicDir, `${baseName}.xlsx`);
    const csvPath = path.join(publicDir, `${baseName}.csv`);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors');
    XLSX.writeFile(workbook, xlsxPath);

    const csv = XLSX.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(csvPath, csv, 'utf8');

    console.log(`Evaluation year: ${evaluationYear}`);
    console.log(`Vendors exported: ${rows.length}`);
    console.log(`Excel: ${xlsxPath}`);
    console.log(`CSV:   ${csvPath}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
