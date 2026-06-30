import React from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import AnnualEvaluationPDFDocument from './AnnualEvaluationPDFDocument';

export default function AnnualEvaluationPrintViewer({ summary, onPrint }) {
  if (!summary) return null;

  const fileName = `vendor-evaluation-${summary.vendorcode}-${summary.evaluationYear}.pdf`;

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <PDFDownloadLink
          document={<AnnualEvaluationPDFDocument summary={summary} />}
          fileName={fileName}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {({ loading }) => (
            <>
              <FiDownload className="mr-2" />
              {loading ? 'Preparing…' : 'Download PDF'}
            </>
          )}
        </PDFDownloadLink>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
        >
          <FiPrinter className="mr-2" /> Print
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <PDFViewer width="100%" height="100%" showToolbar>
          <AnnualEvaluationPDFDocument summary={summary} />
        </PDFViewer>
      </div>
    </div>
  );
}
