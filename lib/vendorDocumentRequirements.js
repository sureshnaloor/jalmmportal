export const REQUIRED_MIN_DOCUMENT_TYPES = [
  'CR',
  'VAT',
  'BANK_ACCOUNT_LETTER',
  'NATIONAL_ADDRESS',
];

export const REQUIRED_MIN_DOCUMENT_LABELS = {
  CR: 'Commercial Registration (CR)',
  VAT: 'VAT Certificate',
  BANK_ACCOUNT_LETTER: 'Bank Account Letter',
  NATIONAL_ADDRESS: 'National Address',
};

export function getVendorDocumentTypes(documents) {
  return new Set((documents || []).map((doc) => doc.documentType).filter(Boolean));
}

export function getMissingRequiredDocuments(documents) {
  const present = getVendorDocumentTypes(documents);
  return REQUIRED_MIN_DOCUMENT_TYPES.filter((type) => !present.has(type));
}

export function hasCompleteMinDocumentSet(documents) {
  return getMissingRequiredDocuments(documents).length === 0;
}

export function hasNoDocuments(documents) {
  return !documents || documents.length === 0;
}

export function attachDocumentFlags(vendor) {
  const documents = vendor.documents || [];
  const missingMinDocuments = getMissingRequiredDocuments(documents).map((code) => ({
    code,
    label: REQUIRED_MIN_DOCUMENT_LABELS[code] || code,
  }));

  return {
    ...vendor,
    hasNoDocuments: hasNoDocuments(documents),
    hasCompleteMinDocuments: hasCompleteMinDocumentSet(documents),
    missingMinDocuments,
  };
}
