import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';
import HeaderComponent from '../../../components/HeaderNewComponent';
import { buildEvaluationSummary } from '../../../lib/vendorEvaluationApproval';

const PrintViewer = dynamic(() => import('../../../components/VendorEvaluation/AnnualEvaluationPrintViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  ),
});

function VendorEvaluationPrintPage() {
  const router = useRouter();
  const { vendorcode } = router.query;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vendorcode) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vendors/annual-evaluation/${vendorcode}`);
        if (!res.ok) throw new Error('Failed to load evaluation');
        const data = await res.json();
        if (!data.evaluation?.approved) {
          setError('Print is available only after the evaluation is approved by the supply chain head.');
          setSummary(null);
        } else {
          setSummary(buildEvaluationSummary(data));
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load');
      }
      setLoading(false);
    };

    load();
  }, [vendorcode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col print-page-root">
      <HeaderComponent />
      <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm no-print">
        <button
          type="button"
          onClick={() => router.push('/vendor-evaluation-current-year')}
          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" /> Back to list
        </button>
      </div>

      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto mt-12 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/vendor-evaluation-current-year')}
              className="mt-4 text-blue-600 underline text-sm"
            >
              Return to vendor list
            </button>
          </div>
        ) : summary ? (
          <PrintViewer summary={summary} onPrint={handlePrint} />
        ) : null}
      </main>
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

export default VendorEvaluationPrintPage;
