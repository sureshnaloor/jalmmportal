import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { FiArrowLeft } from 'react-icons/fi';
import HeaderComponent from '../../components/HeaderNewComponent';
import GroupVendorMappingPrintViewer from '../../components/MaterialGroups/GroupVendorMappingPrintViewer';

function TypeGroupPrintPage() {
  const router = useRouter();
  const iframePrintRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `material-service-types-groups-${stamp}.pdf`;

  useEffect(() => {
    let objectUrl;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/materialgroups/type-group-report?format=pdf');
        if (!res.ok) throw new Error('Failed to generate types & groups PDF');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load report');
        setPdfUrl(null);
      }
      setLoading(false);
    };

    load();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handlePrint = () => {
    const frame = iframePrintRef.current?.querySelector('iframe');
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col print-page-root">
      <HeaderComponent />
      <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm no-print">
        <button
          type="button"
          onClick={() => router.push('/material-groups')}
          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" /> Back to material groups
        </button>
      </div>

      <main className="flex-1 p-4" ref={iframePrintRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
            <p className="mt-4 text-sm text-gray-600">Building the types &amp; groups PDF…</p>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto mt-12 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/material-groups')}
              className="mt-4 text-blue-600 underline text-sm"
            >
              Return to material groups
            </button>
          </div>
        ) : (
          <GroupVendorMappingPrintViewer pdfUrl={pdfUrl} fileName={fileName} onPrint={handlePrint} />
        )}
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

export default TypeGroupPrintPage;
