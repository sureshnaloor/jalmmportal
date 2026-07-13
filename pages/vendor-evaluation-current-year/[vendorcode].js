import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import VendorFeedbackRatingCard from '../../components/VendorFeedbackRatingCard';
import POEvaluationCard from '../../components/VendorEvaluation/POEvaluationCard';
import VendorEvaluationGroupSection from '../../components/VendorEvaluation/VendorEvaluationGroupSection';
import SupplementaryEvaluationSections from '../../components/VendorEvaluation/SupplementaryEvaluationSections';
import { FiArrowLeft, FiSave, FiPrinter, FiCheck, FiEdit3 } from 'react-icons/fi';
import { getVendorEvaluationYear } from '../../lib/vendorEvaluationYear';
import {
  computeCategoryOverall,
  computeFeedbackOverall,
} from '../../lib/vendorFeedbackRatingConfig';
import {
  isSupplyChainHead,
  isEvaluationComplete,
  hasScoreEditsBySupplyChainHead,
} from '../../lib/vendorEvaluationApproval';

function VendorEvaluationDetail() {
  const router = useRouter();
  const { vendorcode, editScores: editScoresQuery } = router.query;
  const { data: session } = useSession();
  const evaluationYear = getVendorEvaluationYear();
  const isSch = isSupplyChainHead(session?.user?.email);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [ratingMaterials, setRatingMaterials] = useState({});
  const [ratingServices, setRatingServices] = useState({});
  const [poEvaluations, setPoEvaluations] = useState({});
  const [editScoresMode, setEditScoresMode] = useState(false);

  useEffect(() => {
    if (!vendorcode) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vendors/annual-evaluation/${vendorcode}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load');
        }
        const json = await res.json();
        setData(json);

        const ev = json.evaluation || {};
        setRatingMaterials(ev.ratingMaterials || {});
        setRatingServices(ev.ratingServices || {});

        const poMap = {};
        (ev.poEvaluations || []).forEach((p) => {
          if (p.ponumber) poMap[p.ponumber] = p;
        });
        setPoEvaluations(poMap);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load vendor evaluation');
      }
      setLoading(false);
    };

    load();
  }, [vendorcode]);

  useEffect(() => {
    if (editScoresQuery === '1' && isSch) {
      setEditScoresMode(true);
    }
  }, [editScoresQuery, isSch]);

  const handlePoEvalChange = (ponumber, evalData) => {
    setPoEvaluations((prev) => ({ ...prev, [ponumber]: evalData }));
  };

  const isApproved = Boolean(data?.evaluation?.approved);
  const topPOs = data?.topPOs || [];
  const requiredPoNumbers = topPOs.map((po) => po.ponumber);
  const isEvaluated = Boolean(
    data?.evaluation &&
      isEvaluationComplete(data.evaluation, requiredPoNumbers)
  );
  const canEditScores = isSch && isEvaluated && !isApproved;
  const formDisabled = isApproved || (isEvaluated && !editScoresMode);
  const allowClear = !isApproved && !isEvaluated;
  const scoreEditedBySch = hasScoreEditsBySupplyChainHead(data?.evaluation);

  const reloadEvaluation = async () => {
    if (!vendorcode) return;
    const reload = await fetch(`/api/vendors/annual-evaluation/${vendorcode}`);
    if (reload.ok) {
      const json = await reload.json();
      setData(json);
    }
  };

  const handleSupplementarySaved = async () => {
    await reloadEvaluation();
    toast.success('Supplementary evaluation saved');
  };

  const handleSupplementaryError = (message) => {
    toast.error(message || 'Failed to save supplementary evaluation');
  };

  const handleSave = async () => {
    if (!vendorcode || isApproved) return;
    if (isEvaluated && !editScoresMode) return;

    const poEvalList = topPOs.map((po) => poEvaluations[po.ponumber] || { ponumber: po.ponumber });

    const incompletePO = poEvalList.find(
      (p) => !p.priceRating || !p.deliveryRating || !p.qualityRating || !p.priceSelection
    );
    if (incompletePO) {
      toast.warning(`Complete all PO ratings for ${incompletePO.ponumber} before saving.`);
      return;
    }

    const materialsOverall = computeCategoryOverall(ratingMaterials);
    const servicesOverall = computeCategoryOverall(ratingServices);
    if (materialsOverall == null && servicesOverall == null) {
      toast.warning('Complete at least one fixed parameter rating (Materials or Services).');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editScoresMode
        ? `/api/vendors/annual-evaluation/${vendorcode}/edit-scores`
        : `/api/vendors/annual-evaluation/${vendorcode}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratingMaterials,
          ratingServices,
          poEvaluations: poEvalList,
          updatedBy: session?.user?.name || session?.user?.email,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Save failed');
      }
      toast.success(
        editScoresMode ? 'Scores updated by supply chain head' : 'Vendor evaluation saved successfully'
      );
      await reloadEvaluation();
      if (editScoresMode) setEditScoresMode(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save evaluation');
    }
    setSaving(false);
  };

  const fixedOverall = computeFeedbackOverall(
    computeCategoryOverall(ratingMaterials),
    computeCategoryOverall(ratingServices)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <HeaderComponent />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <HeaderComponent />
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-600">Vendor not found or not eligible for evaluation.</p>
          <button type="button" onClick={() => router.push('/vendor-evaluation-current-year')} className="mt-4 text-blue-600 underline">
            Back to list
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderComponent />
      <ToastContainer position="bottom-center" />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/vendor-evaluation-current-year')}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
            >
              <FiArrowLeft className="mr-2" /> Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Evaluation — {evaluationYear}</h1>
              <p className="text-sm text-gray-600">
                {data.vendorcode} — {data.vendorname}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isApproved && (
              <>
                <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-lg">
                  <FiCheck className="mr-2" /> Approved
                </span>
                <button
                  type="button"
                  onClick={() => window.open(`/vendor-evaluation-current-year/${vendorcode}/print`, '_blank')}
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  <FiPrinter className="mr-2" /> Print PDF
                </button>
              </>
            )}
            {canEditScores && !editScoresMode && (
              <button
                type="button"
                onClick={() => setEditScoresMode(true)}
                className="inline-flex items-center px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                <FiEdit3 className="mr-2" /> Edit Score
              </button>
            )}
            {canEditScores && editScoresMode && (
              <>
                <button
                  type="button"
                  onClick={() => setEditScoresMode(false)}
                  className="inline-flex items-center px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
                >
                  <FiSave className="mr-2" />
                  {saving ? 'Saving…' : 'Save Edited Scores'}
                </button>
              </>
            )}
            {!isApproved && !isEvaluated && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                <FiSave className="mr-2" />
                {saving ? 'Saving…' : 'Save Evaluation'}
              </button>
            )}
          </div>
        </div>

        {isApproved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
            This evaluation was approved on{' '}
            {data.evaluation.approvedAt
              ? new Date(data.evaluation.approvedAt).toLocaleDateString()
              : '—'}{' '}
            by {data.evaluation.approvedBy || 'supply chain head'}. Editing is locked.
          </div>
        )}

        {editScoresMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
            You are editing scores as supply chain head. Original evaluator marks are preserved in
            system history; saved changes will appear on the final printout.
          </div>
        )}

        {isEvaluated && !isApproved && !editScoresMode && scoreEditedBySch && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            Scores were adjusted by the supply chain head
            {data.evaluation.lastScoreEditAt
              ? ` on ${new Date(data.evaluation.lastScoreEditAt).toLocaleDateString()}`
              : ''}
            . Original evaluator marks are stored in history.
          </div>
        )}

        {isEvaluated && !isApproved && !isSch && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
            This evaluation is complete and awaiting approval by the supply chain head. Editing is
            locked.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase">Total {evaluationYear} PO Value</p>
            <p className="text-xl font-bold text-blue-900">{data.totalPoValue?.toLocaleString()} SAR</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <p className="text-xs text-gray-500 uppercase">PO Count</p>
            <p className="text-xl font-bold text-indigo-900">{data.poCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <p className="text-xs text-gray-500 uppercase">Fixed Parameters Overall</p>
            <p className="text-xl font-bold text-amber-900">{fixedOverall != null ? `${fixedOverall} / 5` : '—'}</p>
          </div>
        </div>

        <VendorEvaluationGroupSection
          vendorCode={data.vendorcode}
          vendorName={data.vendorname}
          disabled={formDisabled}
        />

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Fixed Evaluation Parameters</h2>
          <VendorFeedbackRatingCard
            ratingMaterials={ratingMaterials}
            ratingServices={ratingServices}
            onMaterialsChange={setRatingMaterials}
            onServicesChange={setRatingServices}
            disabled={formDisabled}
            allowClear={allowClear}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Top 2 POs by Value — Variable Parameters</h2>
          <p className="text-sm text-gray-600 mb-6 italic">
            Below parameters vary per PO based on execution (on-time delivery and quality of supply); overall marks are weighted based on PO value.
          </p>
          <div className="space-y-8">
            {data.topPOs?.map((po, idx) => (
              <POEvaluationCard
                key={po.ponumber}
                po={po}
                rank={idx + 1}
                evaluation={poEvaluations[po.ponumber] || {}}
                onChange={(evalData) => handlePoEvalChange(po.ponumber, evalData)}
                disabled={formDisabled}
                allowClear={allowClear}
              />
            ))}
          </div>
        </section>

        {!isApproved && !isEvaluated && (
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              <FiSave className="mr-2" />
              {saving ? 'Saving…' : 'Save Evaluation'}
            </button>
          </div>
        )}

        {canEditScores && editScoresMode && (
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditScoresMode(false)}
              className="inline-flex items-center px-5 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium"
            >
              <FiSave className="mr-2" />
              {saving ? 'Saving…' : 'Save Edited Scores'}
            </button>
          </div>
        )}

        <SupplementaryEvaluationSections
          vendorcode={vendorcode}
          evaluation={data?.evaluation}
          disabled={isApproved}
          rankedBy={session?.user?.name || session?.user?.email}
          onSaved={handleSupplementarySaved}
          onError={handleSupplementaryError}
        />
      </main>
      <FooterComponent />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { session } };
}

export default VendorEvaluationDetail;
