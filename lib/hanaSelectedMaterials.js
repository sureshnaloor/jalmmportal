import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const EXCEL_FILE_NAME = 'Selected Materials and suppliers for dev HANA.xlsx';
const JSON_CACHE_FILE = 'hana-selected-materials.json';

let cachedMaterials = null;

function getExcelPath() {
  return path.join(process.cwd(), 'public', EXCEL_FILE_NAME);
}

function getJsonCachePath() {
  return path.join(process.cwd(), 'data', JSON_CACHE_FILE);
}

function normalizeRow(row) {
  const materialCode = String(row['Material ID'] || row['Material'] || '').trim();
  if (!materialCode) return null;

  return {
    materialCode,
    description: String(row['Material description'] || row['Material Description'] || '').trim(),
    unitMeasure: String(row.UOM || row['Unit of measure'] || '').trim(),
    sapMaterialType: String(row['Material type'] || '').trim(),
    sapMaterialGroup: String(row['Material group'] || '').trim(),
  };
}

export function loadHanaSelectedMaterialsFromExcel() {
  const excelPath = getExcelPath();
  if (!fs.existsSync(excelPath)) {
    throw new Error(`HANA materials Excel file not found: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const byCode = new Map();
  for (const row of rows) {
    const normalized = normalizeRow(row);
    if (!normalized) continue;
    byCode.set(normalized.materialCode, normalized);
  }

  return Array.from(byCode.values()).sort((a, b) =>
    a.materialCode.localeCompare(b.materialCode, undefined, { numeric: true })
  );
}

export function writeHanaSelectedMaterialsCache(materials) {
  const cachePath = getJsonCachePath();
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(materials, null, 2), 'utf8');
}

export function loadHanaSelectedMaterialsFromCache() {
  const cachePath = getJsonCachePath();
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  const raw = fs.readFileSync(cachePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : null;
}

export function getHanaSelectedMaterials({ refresh = false } = {}) {
  if (!refresh && cachedMaterials) {
    return cachedMaterials;
  }

  if (!refresh) {
    const fromCache = loadHanaSelectedMaterialsFromCache();
    if (fromCache?.length) {
      cachedMaterials = fromCache;
      return cachedMaterials;
    }
  }

  const fromExcel = loadHanaSelectedMaterialsFromExcel();
  writeHanaSelectedMaterialsCache(fromExcel);
  cachedMaterials = fromExcel;
  return cachedMaterials;
}

export function getHanaSelectedMaterialCodes() {
  return getHanaSelectedMaterials().map((item) => item.materialCode);
}

export function buildHanaMaterialSearchMatch(search, hanaMaterials) {
  if (!search?.trim()) {
    return null;
  }

  const cleaned = search.trim().replace(/^\*+|\*+$/g, '');
  const terms = cleaned
    .split('*')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 4);

  if (terms.length === 0) {
    return null;
  }

  return hanaMaterials.filter((item) =>
    terms.every((term) =>
      item.materialCode.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.sapMaterialType.toLowerCase().includes(term) ||
      item.sapMaterialGroup.toLowerCase().includes(term)
    )
  );
}

export function sortHanaMaterials(materials, sortBy, sortOrder) {
  const direction = sortOrder === 'desc' ? -1 : 1;
  const fieldMap = {
    'material-code': 'materialCode',
    'material-description': 'description',
    'material-type': 'sapMaterialType',
    'material-group': 'sapMaterialGroup',
    'unit-measure': 'unitMeasure',
  };
  const field = fieldMap[sortBy] || 'materialCode';

  return [...materials].sort((a, b) => {
    const av = String(a[field] || '');
    const bv = String(b[field] || '');
    return av.localeCompare(bv, undefined, { numeric: true }) * direction;
  });
}
