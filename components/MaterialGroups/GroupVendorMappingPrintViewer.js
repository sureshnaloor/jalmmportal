import React from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';

export default function GroupVendorMappingPrintViewer({ pdfUrl, fileName, onPrint }) {
  if (!pdfUrl) return null;

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <a
          href={pdfUrl}
          download={fileName}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <FiDownload className="mr-2" />
          Download PDF
        </a>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
        >
          <FiPrinter className="mr-2" /> Print
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <iframe title="Group vendor mapping PDF" src={pdfUrl} className="w-full h-full border-0" />
      </div>
    </div>
  );
}
