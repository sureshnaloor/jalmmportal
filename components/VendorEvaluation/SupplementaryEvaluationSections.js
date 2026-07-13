import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import {
  PAYMENT_TERMS_OPTIONS,
  ISO_CERTIFICATION_OPTIONS,
} from '../../lib/vendorSupplementaryEvaluationConfig';

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
}

function SupplementaryCard({
  title,
  bgClass,
  borderClass,
  options,
  selectionId,
  onSelectionChange,
  savedRecord,
  onSave,
  saving,
  disabled,
}) {
  const selectedOption = options.find((option) => option.id === selectionId);

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${bgClass} ${borderClass}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <label className="block text-sm font-medium text-gray-700 mb-2">Selection</label>
      <select
        value={selectionId}
        onChange={(event) => onSelectionChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} ({option.marks} / 100)
          </option>
        ))}
      </select>

      <div className="mt-4 text-sm">
        <div className="rounded-lg bg-white/80 px-3 py-2 border border-white inline-block min-w-[140px]">
          <p className="text-xs uppercase text-gray-500">Score (out of 100)</p>
          <p className="text-lg font-bold text-gray-900">
            {selectedOption?.marks ?? savedRecord?.marks ?? '—'}
          </p>
        </div>
      </div>

      {savedRecord && (
        <div className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-600 border border-white">
          Ranked by <span className="font-medium text-gray-800">{savedRecord.rankedBy || '—'}</span>
          {' '}on <span className="font-medium text-gray-800">{formatDateTime(savedRecord.rankedAt)}</span>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || saving || !selectionId}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          <FiSave className="mr-2" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function SupplementaryEvaluationSections({
  vendorcode,
  evaluation,
  disabled,
  rankedBy,
  onSaved,
  onError,
}) {
  const [paymentTermsId, setPaymentTermsId] = useState('');
  const [isoCertificationId, setIsoCertificationId] = useState('');
  const [paymentTermsRecord, setPaymentTermsRecord] = useState(null);
  const [isoCertificationRecord, setIsoCertificationRecord] = useState(null);
  const [savingPaymentTerms, setSavingPaymentTerms] = useState(false);
  const [savingIso, setSavingIso] = useState(false);

  useEffect(() => {
    setPaymentTermsId(evaluation?.paymentTerms?.selectionId || '');
    setPaymentTermsRecord(evaluation?.paymentTerms || null);
    setIsoCertificationId(evaluation?.isoCertification?.selectionId || '');
    setIsoCertificationRecord(evaluation?.isoCertification || null);
  }, [evaluation]);

  const savePaymentTerms = async () => {
    if (!vendorcode || !paymentTermsId) return;
    setSavingPaymentTerms(true);
    try {
      const res = await fetch(
        `/api/vendors/annual-evaluation/${encodeURIComponent(vendorcode)}/payment-terms`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectionId: paymentTermsId, rankedBy }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to save payment terms');
      setPaymentTermsRecord(payload.paymentTerms);
      onSaved?.();
    } catch (error) {
      console.error(error);
      onError?.(error.message);
    } finally {
      setSavingPaymentTerms(false);
    }
  };

  const saveIsoCertification = async () => {
    if (!vendorcode || !isoCertificationId) return;
    setSavingIso(true);
    try {
      const res = await fetch(
        `/api/vendors/annual-evaluation/${encodeURIComponent(vendorcode)}/iso-certification`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectionId: isoCertificationId, rankedBy }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to save ISO certification');
      setIsoCertificationRecord(payload.isoCertification);
      onSaved?.();
    } catch (error) {
      console.error(error);
      onError?.(error.message);
    } finally {
      setSavingIso(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Evaluation Parameters</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupplementaryCard
          title="Payment Terms"
          bgClass="bg-violet-50"
          borderClass="border-violet-200"
          options={PAYMENT_TERMS_OPTIONS}
          selectionId={paymentTermsId}
          onSelectionChange={setPaymentTermsId}
          savedRecord={paymentTermsRecord}
          onSave={savePaymentTerms}
          saving={savingPaymentTerms}
          disabled={disabled}
        />
        <SupplementaryCard
          title="ISO Certification"
          bgClass="bg-teal-50"
          borderClass="border-teal-200"
          options={ISO_CERTIFICATION_OPTIONS}
          selectionId={isoCertificationId}
          onSelectionChange={setIsoCertificationId}
          savedRecord={isoCertificationRecord}
          onSave={saveIsoCertification}
          saving={savingIso}
          disabled={disabled}
        />
      </div>
    </section>
  );
}
