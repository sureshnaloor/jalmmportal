export const PO_EVALUATION_WEIGHTS = {
  price: { label: 'Price', weight: 30, description: 'Whether L-1 or chosen for other non-commercial reasons' },
  delivery: { label: 'On Time Delivery', weight: 20, description: 'Variance from PO date to actual delivery' },
  quality: { label: 'Quality', weight: 10, description: 'MDR, NCR, or other observations' },
};

export const MIN_VENDOR_PO_VALUE_SAR = 10000;

export const PRICE_SELECTION_OPTIONS = [
  { value: 'l1', label: 'L-1 (lowest price)' },
  { value: 'non-commercial', label: 'Chosen for other non-commercial reasons' },
];

/**
 * Weighted PO variable score (0–100) from 1–5 star ratings using 30/20/10 weightage.
 */
export function computeWeightedPOVariableScore(priceRating, deliveryRating, qualityRating) {
  const p = Number(priceRating) || 0;
  const d = Number(deliveryRating) || 0;
  const q = Number(qualityRating) || 0;
  if (!p && !d && !q) return null;
  const totalWeight = PO_EVALUATION_WEIGHTS.price.weight + PO_EVALUATION_WEIGHTS.delivery.weight + PO_EVALUATION_WEIGHTS.quality.weight;
  const weighted =
    (p / 5) * PO_EVALUATION_WEIGHTS.price.weight +
    (d / 5) * PO_EVALUATION_WEIGHTS.delivery.weight +
    (q / 5) * PO_EVALUATION_WEIGHTS.quality.weight;
  return Math.round((weighted / totalWeight) * 1000) / 10;
}
