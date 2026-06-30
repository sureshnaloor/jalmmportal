import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import { FiX, FiCheck, FiAlertCircle, FiEdit3 } from 'react-icons/fi';
import { isSupplyChainHead, buildEvaluationSummary } from '../../lib/vendorEvaluationApproval';

export default function ApprovalModal({ vendorcode, vendorname, open, onClose, onApproved }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const canApprove = isSupplyChainHead(session?.user?.email);

  useEffect(() => {
    if (!open || !vendorcode) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/vendors/annual-evaluation/${vendorcode}`);
        if (!res.ok) throw new Error('Failed to load evaluation');
        const data = await res.json();
        setSummary(buildEvaluationSummary(data));
      } catch (err) {
        setError(err.message || 'Failed to load');
      }
      setLoading(false);
    };

    load();
  }, [open, vendorcode]);

  const handleApprove = async () => {
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/vendors/annual-evaluation/${vendorcode}/approve`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Approval failed');
      }
      onApproved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setApproving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Approve Vendor Evaluation</h2>
            <p className="text-sm text-gray-600">{vendorcode} — {vendorname}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
          ) : error && !summary ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : !canApprove ? (
            <div className="text-center py-8">
              <FiAlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-800">Can be approved by supply chain head only</p>
              <p className="text-sm text-gray-500 mt-2">
                Only the supply chain head can approve this evaluation.
              </p>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 uppercase">Year</p>
                  <p className="font-bold text-blue-900">{summary.evaluationYear}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 uppercase">Total PO Value</p>
                  <p className="font-bold text-indigo-900">{summary.totalPoValue?.toLocaleString()} SAR</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-600 uppercase">Fixed Overall</p>
                  <p className="font-bold text-amber-900">{summary.fixedOverall ?? '—'} / 5</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 uppercase">Evaluated By</p>
                  <p className="font-bold text-green-900 text-sm truncate">{summary.evaluatedBy || '—'}</p>
                  {summary.evaluatedAt && (
                    <p className="text-xs text-green-700">{moment(summary.evaluatedAt).format('DD MMM YYYY')}</p>
                  )}
                </div>
              </div>

              {summary.poSummaries?.map((po) => (
                <div key={po.ponumber} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">PO {po.ponumber}</h3>
                    <span className="text-sm font-medium text-gray-700">{po.povalue?.toLocaleString()} SAR</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Price: <strong>{po.evaluation?.priceRating || '—'}/5</strong></div>
                    <div>Delivery: <strong>{po.evaluation?.deliveryRating || '—'}/5</strong></div>
                    <div>Quality: <strong>{po.evaluation?.qualityRating || '—'}/5</strong></div>
                  </div>
                  {po.weightedScore != null && (
                    <p className="text-sm text-rose-700 mt-2 font-medium">
                      Weighted PO score: {po.weightedScore}%
                    </p>
                  )}
                </div>
              ))}

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          {canApprove && summary && !summary.approved && (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/vendor-evaluation-current-year/${vendorcode}?editScores=1`);
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
            >
              <FiEdit3 className="mr-2" />
              Edit Score
            </button>
          )}
          {canApprove && summary && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving || summary.approved}
              className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <FiCheck className="mr-2" />
              {approving ? 'Approving…' : summary.approved ? 'Already Approved' : 'Approve Evaluation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
