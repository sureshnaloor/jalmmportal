/** PO evaluation targets the previous calendar year (e.g. 2025 when run in 2026). */
export function getVendorEvaluationYear(referenceDate = new Date()) {
  return referenceDate.getFullYear() - 1;
}

export function getVendorEvaluationYearRange(year) {
  return {
    yearStart: new Date(year, 0, 1, 0, 0, 0, 0),
    yearEnd: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}

export function getAnnualEvaluationStorageKey(year) {
  return `annualeval${year}`;
}
