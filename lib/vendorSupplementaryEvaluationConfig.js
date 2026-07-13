export const PAYMENT_TERMS_OPTIONS = [
  {
    id: 'full_credit_30_plus',
    label: '30 and above days full credit',
    marks: 100,
  },
  {
    id: 'partial_credit',
    label: 'partial credit (>50% after delivery)',
    marks: 80,
  },
  {
    id: 'lc_deferred',
    label: 'L/C deferred payment',
    marks: 60,
  },
  {
    id: 'cash_carry',
    label: 'cash and carry',
    marks: 40,
  },
  {
    id: 'advance_po',
    label: 'advance with PO',
    marks: 20,
  },
];

export const ISO_CERTIFICATION_OPTIONS = [
  {
    id: 'iso_triple',
    label: 'ISO 9001, 14001 and 45001 or equivalent valid',
    marks: 100,
  },
  {
    id: 'iso_9001',
    label: 'ISO 9001 valid',
    marks: 75,
  },
  {
    id: 'in_house_qc',
    label: 'In-house Quality plan valid',
    marks: 50,
  },
  {
    id: 'no_certificate',
    label: 'no certificate',
    marks: 25,
  },
];

export function getPaymentTermsOption(selectionId) {
  return PAYMENT_TERMS_OPTIONS.find((option) => option.id === selectionId) || null;
}

export function getIsoCertificationOption(selectionId) {
  return ISO_CERTIFICATION_OPTIONS.find((option) => option.id === selectionId) || null;
}
