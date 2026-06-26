import { attachDocumentFlags } from './vendorDocumentRequirements';

export const DORMANT_PO_CUTOFF = new Date('2020-01-01T00:00:00.000Z');
export const VENDOR_PO_CUTOFF = DORMANT_PO_CUTOFF;

function parseScore(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'object' && value.$numberDecimal != null) {
    const n = parseFloat(value.$numberDecimal);
    return Number.isNaN(n) ? null : n;
  }
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function consolidatePoLines(lines) {
  const byPo = {};
  for (const line of lines) {
    const ponum = line['po-number'];
    if (!ponum) continue;
    if (!byPo[ponum]) {
      byPo[ponum] = {
        ponum,
        podate: line['po-date'],
        vendorname: line.vendorname || line['vendor-name'] || '',
        poval: 0,
        balgrval: 0,
      };
    }
    byPo[ponum].poval += line['po-value-sar'] || 0;
    byPo[ponum].balgrval += line['pending-val-sar'] || 0;
  }
  return Object.values(byPo).sort((a, b) => new Date(b.podate || 0) - new Date(a.podate || 0));
}

export function formatEvaluationSummary(marks, evalDoc) {
  if (!marks && !evalDoc) return null;

  const summary = {
    finalfixedscore: parseScore(marks?.finalfixedscore),
    finalscore2022: parseScore(marks?.finalscore2022),
    finalscore2023: parseScore(marks?.finalscore2023),
    finalscore2024: parseScore(marks?.finalscore2024),
    pastYears: [],
  };

  if (evalDoc?.past && Array.isArray(evalDoc.past)) {
    summary.pastYears = evalDoc.past
      .map((p) => ({ year: p.pastyear, score: parseScore(p.pastyearscore) }))
      .filter((p) => p.year != null && p.score != null);
  }

  const hasAnyScore =
    summary.finalfixedscore != null ||
    summary.finalscore2022 != null ||
    summary.finalscore2023 != null ||
    summary.finalscore2024 != null ||
    summary.pastYears.length > 0;

  return hasAnyScore ? summary : null;
}

export function mapDocuments(docs) {
  return (docs || []).map((doc) => ({
    name: doc.originalName || doc.filename || 'Document',
    documentType: doc.documentType || '',
  }));
}

function attachDocumentMetadata(vendor, rawDocs) {
  const documents = mapDocuments(rawDocs);
  return {
    vendorCode: vendor.vendorCode,
    vendorName: vendor.vendorName || '',
    documents,
    documentTypes: [...new Set(documents.map((d) => d.documentType).filter(Boolean))],
  };
}

export async function fetchDormantVendorsReport(db) {
  const dormantVendors = await db
    .collection('vendors')
    .aggregate([
      { $match: { 'vendor-code': { $exists: true, $ne: '' } } },
      {
        $lookup: {
          from: 'purchaseorders',
          let: { vcode: '$vendor-code' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$vendorcode', '$$vcode'] },
                'po-date': { $gte: DORMANT_PO_CUTOFF },
              },
            },
            { $limit: 1 },
          ],
          as: 'posSinceCutoff',
        },
      },
      { $match: { posSinceCutoff: { $size: 0 } } },
      {
        $project: {
          _id: 0,
          vendorCode: '$vendor-code',
          vendorName: '$vendor-name',
        },
      },
      { $sort: { vendorName: 1 } },
    ])
    .toArray();

  if (!dormantVendors.length) return [];

  const vendorCodes = dormantVendors.map((v) => v.vendorCode);

  const poLines = await db
    .collection('purchaseorders')
    .find({ vendorcode: { $in: vendorCodes } })
    .toArray();

  const posByVendor = {};
  poLines.forEach((line) => {
    const code = line.vendorcode;
    if (!code) return;
    if (!posByVendor[code]) posByVendor[code] = [];
    posByVendor[code].push(line);
  });

  const enriched = await enrichVendorsWithDetails(db, dormantVendors);

  return enriched.map((vendor) => {
    const purchaseOrders = consolidatePoLines(posByVendor[vendor.vendorCode] || []);
    const lastPoDate = purchaseOrders.length > 0 ? purchaseOrders[0].podate : null;

    return {
      ...vendor,
      lastPoDate,
      poCount: purchaseOrders.length,
      purchaseOrders,
    };
  });
}

export function getPrintFontScale({ poCount = 0, docCount = 0, hasEvaluation = false }) {
  const evalLines = hasEvaluation ? 5 : 0;
  const total = poCount + docCount + evalLines;
  if (total <= 6) return 1;
  if (total <= 12) return 0.92;
  if (total <= 20) return 0.84;
  if (total <= 30) return 0.76;
  return 0.68;
}

export function getActiveVendorPrintFontScale({ docCount = 0 }) {
  if (docCount <= 10) return 1;
  if (docCount <= 20) return 0.92;
  if (docCount <= 35) return 0.84;
  return 0.76;
}

async function enrichVendorsWithDetails(db, vendors) {
  if (!vendors.length) return [];

  const vendorCodes = vendors.map((v) => v.vendorCode);

  const [documents, evaluationMarks, evaluationDocs] = await Promise.all([
    db
      .collection('vendordocuments')
      .find({ vendorCode: { $in: vendorCodes } })
      .project({ vendorCode: 1, originalName: 1, filename: 1, documentType: 1 })
      .toArray(),
    db
      .collection('vendorevaluationmarks')
      .find({ vendorcode: { $in: vendorCodes } })
      .toArray(),
    db
      .collection('vendorevaluation')
      .find({ vendorcode: { $in: vendorCodes } })
      .toArray(),
  ]);

  const docsByVendor = {};
  documents.forEach((doc) => {
    const code = doc.vendorCode;
    if (!code) return;
    if (!docsByVendor[code]) docsByVendor[code] = [];
    docsByVendor[code].push(doc);
  });

  const marksByVendor = {};
  evaluationMarks.forEach((m) => {
    if (m.vendorcode) marksByVendor[m.vendorcode] = m;
  });

  const evalByVendor = {};
  evaluationDocs.forEach((e) => {
    if (e.vendorcode) evalByVendor[e.vendorcode] = e;
  });

  return vendors.map((vendor) => {
    const rawDocs = docsByVendor[vendor.vendorCode] || [];
    const base = attachDocumentMetadata(vendor, rawDocs);
    return {
      ...base,
      evaluation: formatEvaluationSummary(
        marksByVendor[vendor.vendorCode],
        evalByVendor[vendor.vendorCode]
      ),
    };
  });
}

export async function fetchActiveVendorsReport(db) {
  const activeVendors = await db
    .collection('vendors')
    .aggregate([
      { $match: { 'vendor-code': { $exists: true, $ne: '' } } },
      {
        $lookup: {
          from: 'purchaseorders',
          let: { vcode: '$vendor-code' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$vendorcode', '$$vcode'] },
                'po-date': { $gte: VENDOR_PO_CUTOFF },
              },
            },
            { $limit: 1 },
          ],
          as: 'posSinceCutoff',
        },
      },
      { $match: { 'posSinceCutoff.0': { $exists: true } } },
      {
        $project: {
          _id: 0,
          vendorCode: '$vendor-code',
          vendorName: '$vendor-name',
        },
      },
      { $sort: { vendorName: 1 } },
    ])
    .toArray();

  if (!activeVendors.length) return [];

  const vendorCodes = activeVendors.map((v) => v.vendorCode);

  const poLines = await db
    .collection('purchaseorders')
    .find({ vendorcode: { $in: vendorCodes } })
    .toArray();

  const posByVendor = {};
  poLines.forEach((line) => {
    const code = line.vendorcode;
    if (!code) return;
    if (!posByVendor[code]) posByVendor[code] = [];
    posByVendor[code].push(line);
  });

  const enriched = await enrichVendorsWithDetails(db, activeVendors);

  return enriched.map((vendor) => {
    const purchaseOrders = consolidatePoLines(posByVendor[vendor.vendorCode] || []);
    const lastPoDate = purchaseOrders.length > 0 ? purchaseOrders[0].podate : null;

    return attachDocumentFlags({
      ...vendor,
      lastPoDate,
      poCount: purchaseOrders.length,
    });
  });
}
