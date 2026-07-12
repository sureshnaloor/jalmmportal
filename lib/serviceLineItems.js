const SERVICE_CODE_ALIASES = [
  'service-code',
  'service code',
  'servicecode',
  'service_code',
  'code',
  'material-code',
  'material code',
  'matcode',
  'mat-code',
];

const SERVICE_DESCRIPTION_ALIASES = [
  'service-description',
  'service description',
  'servicedescription',
  'service_description',
  'description',
  'material-description',
  'material description',
  'matdescription',
  'service',
  'service line item',
  'service line',
  'line item description',
];

const UNIT_MEASURE_ALIASES = [
  'unit-measure',
  'unit measure',
  'unitmeasure',
  'unit_measure',
  'uom',
  'unit',
];

export const SERVICE_TEMPLATE_CSV = `service-code,service-description,unit-measure
SVC-001,ANNUAL MAINTENANCE CONTRACT,EA
SVC-002,TECHNICAL CONSULTANCY SERVICES,HR
SVC-003,TRANSPORTATION AND LOGISTICS SERVICES,EA
SVC-004,INSPECTION AND TESTING SERVICES,EA
SVC-005,SCAFFOLDING ERECTION AND DISMANTLING SERVICES,EA`;

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

export function parseServiceLineItemRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { records: [], errors: ['No data rows found in file'] };
  }

  const firstRow = rows.find((row) => row && Object.keys(row).length > 0);
  if (!firstRow) {
    return { records: [], errors: ['No data rows found in file'] };
  }

  const codeKey = findColumnKey(firstRow, SERVICE_CODE_ALIASES);
  const descKey = findColumnKey(firstRow, SERVICE_DESCRIPTION_ALIASES);
  const uomKey = findColumnKey(firstRow, UNIT_MEASURE_ALIASES);

  if (!codeKey) {
    return {
      records: [],
      errors: ['Could not find a service code column (expected service-code, service code, or code)'],
    };
  }

  if (!descKey) {
    return {
      records: [],
      errors: [
        'Could not find a service description column (expected service-description, description, or service line item)',
      ],
    };
  }

  const records = [];
  const errors = [];
  const seen = new Set();

  rows.forEach((row, index) => {
    const serviceCode = String(row[codeKey] ?? '').trim();
    const serviceDescription = String(row[descKey] ?? '').trim();
    const unitMeasure = uomKey ? String(row[uomKey] ?? '').trim() : '';

    if (!serviceCode && !serviceDescription) {
      return;
    }

    if (!serviceCode) {
      errors.push(`Row ${index + 2}: missing service code`);
      return;
    }

    if (!serviceDescription) {
      errors.push(`Row ${index + 2}: missing service description for code "${serviceCode}"`);
      return;
    }

    if (seen.has(serviceCode)) {
      errors.push(`Row ${index + 2}: duplicate service code "${serviceCode}" — last occurrence kept`);
    }
    seen.add(serviceCode);

    records.push({ serviceCode, serviceDescription, unitMeasure });
  });

  return { records, errors, columns: { codeKey, descKey, uomKey } };
}
