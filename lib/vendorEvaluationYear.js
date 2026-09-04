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

export function getPriorPoEvaluationStorageKey(year) {
  return `priorpoeval${year}`;
}

export const EVALUATION_TRACK = {
  CURRENT_YEAR: 'current-year',
  PRIOR_PO: 'prior-po',
};

export function parseEvaluationTrack(value) {
  return String(value || '') === EVALUATION_TRACK.PRIOR_PO
    ? EVALUATION_TRACK.PRIOR_PO
    : EVALUATION_TRACK.CURRENT_YEAR;
}

export function getEvaluationTrackContext(track, referenceDate = new Date()) {
  const resolvedTrack = parseEvaluationTrack(track);
  const isPriorPo = resolvedTrack === EVALUATION_TRACK.PRIOR_PO;
  const currentCalendarYear = referenceDate.getFullYear();
  const previousCalendarYear = getVendorEvaluationYear(referenceDate);
  const evaluationYear = isPriorPo ? currentCalendarYear : previousCalendarYear;
  const { yearStart, yearEnd } = getVendorEvaluationYearRange(previousCalendarYear);

  return {
    track: resolvedTrack,
    isPriorPo,
    evaluationYear,
    previousCalendarYear,
    currentCalendarYear,
    yearStart,
    yearEnd,
    storageKey: isPriorPo
      ? getPriorPoEvaluationStorageKey(evaluationYear)
      : getAnnualEvaluationStorageKey(evaluationYear),
    listPath: isPriorPo ? '/vendor-evaluation-prior-po' : '/vendor-evaluation-current-year',
    title: isPriorPo
      ? "Vendor Evaluation — Prev Years POs — Fresh Evaluation Current Year"
      : 'Vendor Evaluation — Current Year',
  };
}

export function withTrackQuery(path, track) {
  if (parseEvaluationTrack(track) !== EVALUATION_TRACK.PRIOR_PO) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}track=${EVALUATION_TRACK.PRIOR_PO}`;
}
