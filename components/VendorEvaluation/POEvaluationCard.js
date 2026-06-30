import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import POTimelineMini from './POTimelineMini';
import {
  PO_EVALUATION_WEIGHTS,
  PRICE_SELECTION_OPTIONS,
  computeWeightedPOVariableScore,
} from '../../lib/vendorEvaluationConfig';

function StarRating({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === n ? null : n)}
          className="p-0.5 focus:outline-none disabled:opacity-50 text-amber-500"
          style={{ opacity: value != null && value >= n ? 1 : 0.35 }}
        >
          <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
        </button>
      ))}
      <span className="ml-2 text-xs text-gray-600">{value ? `${value}/5` : '—'}</span>
    </div>
  );
}

export default function POEvaluationCard({
  po,
  evaluation = {},
  onChange,
  disabled = false,
  allowClear = false,
  rank,
}) {
  const weightedScore = computeWeightedPOVariableScore(
    evaluation.priceRating,
    evaluation.deliveryRating,
    evaluation.qualityRating
  );

  const update = (field, val) => {
    onChange({ ...evaluation, ponumber: po.ponumber, [field]: val });
  };

  const hasAnyPoRating = Boolean(
    evaluation.priceRating ||
      evaluation.deliveryRating ||
      evaluation.qualityRating ||
      evaluation.priceSelection ||
      evaluation.qualityNotes
  );

  const handleClear = () => {
    onChange({ ponumber: po.ponumber });
  };

  const varianceLabel =
    po.deliveryVarianceDays == null
      ? 'N/A'
      : po.deliveryVarianceDays === 0
      ? 'On time'
      : po.deliveryVarianceDays > 0
      ? `${po.deliveryVarianceDays} day(s) late`
      : `${Math.abs(po.deliveryVarianceDays)} day(s) early`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-300">Top PO #{rank}</p>
          <h3 className="text-lg font-bold">{po.ponumber}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300">PO Value</p>
          <p className="text-lg font-semibold">{po.povalue?.toLocaleString()} SAR</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-600 font-medium text-xs uppercase">PO Date</p>
            <p className="font-semibold text-blue-900">{po.podate ? moment(po.podate).format('DD/MM/YYYY') : 'N/A'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-600 font-medium text-xs uppercase">Planned Delivery</p>
            <p className="font-semibold text-green-900">{po.deliveryDate ? moment(po.deliveryDate).format('DD/MM/YYYY') : 'N/A'}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-orange-600 font-medium text-xs uppercase">Actual Delivery</p>
            <p className="font-semibold text-orange-900">{po.actualDeliveryDate ? moment(po.actualDeliveryDate).format('DD/MM/YYYY') : 'N/A'}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-amber-600 font-medium text-xs uppercase">Delivery Variance</p>
            <p className="font-semibold text-amber-900">{varianceLabel}</p>
          </div>
        </div>

        <POTimelineMini events={po.timeline} />

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Line</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Item / Material</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Unit Rate</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Value (SAR)</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Project / Order / Cost Center</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {po.lineItems?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{item.line}</td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="font-medium text-gray-900">{item.description || '—'}</div>
                    {item.materialCode && <div className="text-xs text-gray-500">{item.materialCode}</div>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{item.quantity} {item.unit}</td>
                  <td className="px-3 py-2">{item.unitRate?.toLocaleString()}</td>
                  <td className="px-3 py-2 font-medium">{item.value?.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">{item.accountAssignment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-rose-900">PO Variable Parameters (weightage)</h4>
            {allowClear && !disabled && hasAnyPoRating && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium px-2.5 py-1 rounded-md border border-rose-200 bg-white text-rose-800 hover:bg-rose-50"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 mb-2">
            {Object.entries(PO_EVALUATION_WEIGHTS).map(([key, cfg]) => (
              <div key={key} className="bg-white rounded-md p-2 border border-rose-100">
                <span className="font-semibold text-rose-800">{cfg.label}</span>
                <span className="text-red-600 font-bold ml-1">{cfg.weight}%</span>
                <p className="mt-1 text-gray-500">{cfg.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 bg-white rounded-lg p-4 border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1) Price — {PO_EVALUATION_WEIGHTS.price.weight}% weightage
              </label>
              <select
                value={evaluation.priceSelection || ''}
                onChange={(e) => update('priceSelection', e.target.value)}
                disabled={disabled}
                className="mb-2 w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select price basis…</option>
                {PRICE_SELECTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <StarRating value={evaluation.priceRating} onChange={(v) => update('priceRating', v)} disabled={disabled} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2) Delivery — {PO_EVALUATION_WEIGHTS.delivery.weight}% weightage
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Variance from PO date: <strong>{varianceLabel}</strong>
              </p>
              <StarRating value={evaluation.deliveryRating} onChange={(v) => update('deliveryRating', v)} disabled={disabled} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3) Quality — {PO_EVALUATION_WEIGHTS.quality.weight}% weightage
              </label>
              <textarea
                value={evaluation.qualityNotes || ''}
                onChange={(e) => update('qualityNotes', e.target.value)}
                disabled={disabled}
                placeholder="MDR, NCR, or other quality observations…"
                rows={2}
                className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <StarRating value={evaluation.qualityRating} onChange={(v) => update('qualityRating', v)} disabled={disabled} />
            </div>

            {weightedScore != null && (
              <div className="pt-3 border-t border-gray-100 text-sm">
                Weighted PO variable score: <span className="font-bold text-rose-700">{weightedScore}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
