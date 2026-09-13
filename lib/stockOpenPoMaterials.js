import fs from 'fs';
import path from 'path';

const JSON_CACHE_FILE = 'stock-open-po-materials.json';
export const STOCK_OPEN_PO_SOURCE_FILE = 'MATERIALS TOBE HANA QAS.xlsx';

let cachedMaterials = null;

function getJsonCachePath() {
  return path.join(process.cwd(), 'data', JSON_CACHE_FILE);
}

export function getStockOpenPoMaterials() {
  if (cachedMaterials) return cachedMaterials;

  const cachePath = getJsonCachePath();
  if (!fs.existsSync(cachePath)) {
    throw new Error(
      `Stock and open PO materials list not found: ${cachePath}`
    );
  }

  const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Stock and open PO materials list is empty');
  }

  cachedMaterials = parsed;
  return cachedMaterials;
}

export function getStockOpenPoMaterialCodes() {
  return getStockOpenPoMaterials().map((item) => item.materialCode);
}

export function materialCodeQueryValues(codes) {
  const values = [];
  for (const code of codes || []) {
    const text = String(code || '').trim();
    if (!text) continue;
    values.push(text);
    if (/^\d+$/.test(text)) {
      const n = Number(text);
      if (Number.isFinite(n)) values.push(n);
    }
  }
  return values;
}

export function normalizeMaterialCode(value) {
  return String(value ?? '').trim();
}

export function buildStockOpenPoSearchMatch(search, items) {
  if (!search?.trim()) return null;

  const cleaned = search.trim().replace(/^\*+|\*+$/g, '');
  const terms = cleaned
    .split('*')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 4);

  if (terms.length === 0) return null;

  return items.filter((item) =>
    terms.every((term) => {
      const haystack = [
        item['material-code'],
        item['material-description'],
        item['material-type'],
        item['material-type-description'],
        item['material-group'],
        item['material-group-description'],
        item['unit-measure'],
        item.mappedSubgroup?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    })
  );
}

export function sortStockOpenPoMaterials(materials, sortBy, sortOrder) {
  const direction = sortOrder === 'desc' ? -1 : 1;
  const fieldMap = {
    'material-code': 'material-code',
    'material-description': 'material-description',
    'material-type': 'material-type',
    'material-group': 'material-group',
    'unit-measure': 'unit-measure',
  };
  const field = fieldMap[sortBy] || 'material-code';

  return [...materials].sort((a, b) => {
    const av = String(a[field] || '');
    const bv = String(b[field] || '');
    return av.localeCompare(bv, undefined, { numeric: true }) * direction;
  });
}
