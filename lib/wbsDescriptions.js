import { escapeRegex } from './wbsPurchaseOrders';

const WBS_NUMBER_ALIASES = [
  'wbs-number',
  'wbs number',
  'wbsnumber',
  'wbs_number',
  'wbs-no',
  'wbs no',
  'wbsno',
  'wbs element',
  'wbs-element',
  'wbselement',
  'wbs',
];

const WBS_DESCRIPTION_ALIASES = [
  'wbs-description',
  'wbs description',
  'wbsdescription',
  'wbs_description',
  'description',
  'wbs name',
  'wbs-name',
  'wbsname',
  'name',
];

export function normalizeWbsNumber(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function findColumnKey(row, aliases) {
  const keys = Object.keys(row || {});
  const normalizedEntries = keys.map((key) => [key, normalizeHeader(key)]);

  for (const alias of aliases) {
    const match = normalizedEntries.find(([, normalized]) => normalized === alias);
    if (match) return match[0];
  }

  for (const alias of aliases) {
    const match = normalizedEntries.find(([, normalized]) => normalized.includes(alias));
    if (match) return match[0];
  }

  return null;
}

/** Parse spreadsheet rows into { wbsNumber, wbsDescription } records. */
export function parseWbsDescriptionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { records: [], errors: ['No data rows found in file'] };
  }

  const firstRow = rows.find((row) => row && Object.keys(row).length > 0);
  if (!firstRow) {
    return { records: [], errors: ['No data rows found in file'] };
  }

  const wbsKey = findColumnKey(firstRow, WBS_NUMBER_ALIASES);
  const descKey = findColumnKey(firstRow, WBS_DESCRIPTION_ALIASES);

  if (!wbsKey) {
    return {
      records: [],
      errors: ['Could not find a WBS number column (expected wbs-number, wbs number, or wbs)'],
    };
  }
  if (!descKey) {
    return {
      records: [],
      errors: ['Could not find a WBS description column (expected wbs-description, description, or name)'],
    };
  }

  const records = [];
  const errors = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const wbsNumber = normalizeWbsNumber(row[wbsKey]);
    const wbsDescription = String(row[descKey] ?? '').trim();

    if (!wbsNumber) return;

    if (seen.has(wbsNumber)) {
      errors.push(`Row ${index + 2}: duplicate WBS "${wbsNumber}" — last occurrence kept`);
    }
    seen.add(wbsNumber);

    records.push({ wbsNumber, wbsDescription });
  });

  return { records, errors, columns: { wbsKey, descKey } };
}

export async function fetchWbsDescriptionsForSubtree(db, rootWbs) {
  if (!rootWbs) return {};

  const escaped = escapeRegex(rootWbs);
  const docs = await db
    .collection('wbsdescriptions')
    .find({ 'wbs-number': { $regex: `^${escaped}(\\.|$)` } })
    .project({ 'wbs-number': 1, 'wbs-description': 1 })
    .toArray();

  const map = {};
  docs.forEach((doc) => {
    const wbs = normalizeWbsNumber(doc['wbs-number']);
    if (wbs) map[wbs] = String(doc['wbs-description'] || '').trim();
  });
  return map;
}

export function applyWbsDescriptionsToTree(node, descriptionMap) {
  if (!node) return node;

  if (!node.isNetwork) {
    node.description = descriptionMap[normalizeWbsNumber(node.wbs)] || '';
  }

  for (const child of node.children || []) {
    applyWbsDescriptionsToTree(child, descriptionMap);
  }

  return node;
}

export function formatWbsWithDescription(wbs, descriptionMap) {
  const wbsNumber = normalizeWbsNumber(wbs);
  if (!wbsNumber) return '—';

  if (wbsNumber.includes(',')) {
    return wbsNumber
      .split(',')
      .map((part) => formatWbsWithDescription(part.trim(), descriptionMap))
      .join(', ');
  }

  const description = descriptionMap[wbsNumber];
  return description ? `${wbsNumber} — ${description}` : wbsNumber;
}
