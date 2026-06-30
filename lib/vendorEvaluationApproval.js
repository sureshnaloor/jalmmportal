import {
  computeCategoryOverall,
  computeFeedbackOverall,
  MATERIALS_RATING_LABELS,
  SERVICES_RATING_LABELS,
} from './vendorFeedbackRatingConfig';
import { computeWeightedPOVariableScore, PRICE_SELECTION_OPTIONS } from './vendorEvaluationConfig';

export const SUPPLY_CHAIN_HEAD_EMAIL = 'suresh.n@jalint.com.sa';

export function isSupplyChainHead(email) {
  if (!email) return false;
  return String(email).trim().toLowerCase() === SUPPLY_CHAIN_HEAD_EMAIL.toLowerCase();
}

/** Deep copy of evaluator score fields for audit history. */
export function extractScoreSnapshot(evaluation) {
  if (!evaluation) return null;
  return {
    ratingMaterials: { ...(evaluation.ratingMaterials || {}) },
    ratingServices: { ...(evaluation.ratingServices || {}) },
    poEvaluations: (evaluation.poEvaluations || []).map((p) => ({ ...p })),
  };
}

export function hasScoreEditsBySupplyChainHead(evaluation) {
  return Boolean(evaluation?.scoreEditedBySupplyChainHead);
}

export function isEvaluationComplete(evaluation, requiredPoNumbers = []) {
  if (!evaluation) return false;

  const materialsOverall = computeCategoryOverall(evaluation.ratingMaterials || {});
  const servicesOverall = computeCategoryOverall(evaluation.ratingServices || {});
  if (materialsOverall == null && servicesOverall == null) return false;

  const poEvals = evaluation.poEvaluations || [];
  if (!requiredPoNumbers.length) {
    return poEvals.some(isPoEvaluationComplete);
  }

  return requiredPoNumbers.every((ponum) => {
    const found = poEvals.find((p) => String(p.ponumber) === String(ponum));
    return isPoEvaluationComplete(found);
  });
}

export function isPoEvaluationComplete(poEval) {
  if (!poEval) return false;
  return Boolean(
    poEval.priceRating &&
      poEval.deliveryRating &&
      poEval.qualityRating &&
      poEval.priceSelection
  );
}

export function getPriceSelectionLabel(value) {
  const opt = PRICE_SELECTION_OPTIONS.find((o) => o.value === value);
  return opt?.label || value || '—';
}

/** Average of per-PO weighted variable scores (0–100) from saved evaluations. */
export function computeVariableOverallFromPoEvals(poEvaluations = []) {
  const scores = (poEvaluations || [])
    .map((p) =>
      computeWeightedPOVariableScore(p.priceRating, p.deliveryRating, p.qualityRating)
    )
    .filter((s) => s != null);
  if (!scores.length) return null;
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg * 10) / 10;
}

/** Fixed (1–5) and variable/PO (%) scores from the active evaluation record. */
export function computeEvaluationDisplayScores(evaluation) {
  if (!evaluation) {
    return { fixedOverall: null, variableOverall: null };
  }
  const materialsOverall = computeCategoryOverall(evaluation.ratingMaterials || {});
  const servicesOverall = computeCategoryOverall(evaluation.ratingServices || {});
  const fixedOverall = computeFeedbackOverall(materialsOverall, servicesOverall);
  const variableOverall = computeVariableOverallFromPoEvals(evaluation.poEvaluations);
  return { fixedOverall, variableOverall };
}

export function formatRatingRows(ratings, labels) {
  if (!ratings || typeof ratings !== 'object') return [];
  return labels.map((label, i) => ({
    key: i + 1,
    label,
    value: ratings[i + 1] ?? null,
  }));
}

export function buildEvaluationSummary(data) {
  const evaluation = data?.evaluation || {};
  const materialsOverall = computeCategoryOverall(evaluation.ratingMaterials || {});
  const servicesOverall = computeCategoryOverall(evaluation.ratingServices || {});
  const fixedOverall = computeFeedbackOverall(materialsOverall, servicesOverall);

  const poSummaries = (data?.topPOs || []).map((po) => {
    const poEval =
      (evaluation.poEvaluations || []).find((p) => String(p.ponumber) === String(po.ponumber)) || {};
    return {
      ...po,
      evaluation: poEval,
      weightedScore: computeWeightedPOVariableScore(
        poEval.priceRating,
        poEval.deliveryRating,
        poEval.qualityRating
      ),
    };
  });

  return {
    evaluationYear: data?.evaluationYear,
    vendorcode: data?.vendorcode,
    vendorname: data?.vendorname,
    totalPoValue: data?.totalPoValue,
    poCount: data?.poCount,
    fixedOverall,
    materialsOverall,
    servicesOverall,
    materialsRows: formatRatingRows(evaluation.ratingMaterials, MATERIALS_RATING_LABELS),
    servicesRows: formatRatingRows(evaluation.ratingServices, SERVICES_RATING_LABELS),
    poSummaries,
    evaluatedBy: evaluation.updatedBy || evaluation.createdBy,
    evaluatedAt: evaluation.updatedAt || evaluation.createdAt,
    approved: Boolean(evaluation.approved),
    approvedBy: evaluation.approvedBy,
    approvedAt: evaluation.approvedAt,
    scoreEditedBySupplyChainHead: Boolean(evaluation.scoreEditedBySupplyChainHead),
    lastScoreEditBy: evaluation.lastScoreEditBy || null,
    lastScoreEditAt: evaluation.lastScoreEditAt || null,
  };
}
