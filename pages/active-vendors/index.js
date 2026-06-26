import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import HeaderNewComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { FiPrinter, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getActiveVendorPrintFontScale } from '../../lib/dormantVendorsReport';

function ActiveVendorPrintPage({ vendor, scale }) {
  const basePt = 10 * scale;
  const sectionPt = 11 * scale;
  const codePt = 22 * scale;
  const namePt = 18 * scale;
  const footerPt = 8 * scale;

  return (
    <div className="active-print-page">
      <header className="active-print-header">
        <div style={{ fontSize: `${codePt}pt`, fontWeight: 'bold', lineHeight: 1.15, color: '#0f172a' }}>
          {vendor.vendorCode}
        </div>
        <div style={{ fontSize: `${namePt}pt`, fontWeight: 'bold', lineHeight: 1.2, marginTop: '0.15cm', color: '#1e293b' }}>
          {vendor.vendorName || '—'}
        </div>
      </header>

      <section className="active-print-body">
        <div style={{ marginBottom: '0.45cm' }}>
          <div style={{ fontSize: `${sectionPt}pt`, fontWeight: 'bold', marginBottom: '0.12cm', color: '#0f172a' }}>
            Pre Qualification Documents
          </div>
          {vendor.documents?.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '0.45cm', fontSize: `${basePt}pt`, lineHeight: 1.4 }}>
              {vendor.documents.map((doc, index) => (
                <li key={`${doc.name}-${index}`}>
                  {doc.name}
                  {doc.documentType ? ` (${doc.documentType})` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: `${basePt}pt`, color: '#64748b', margin: 0 }}>No documents on file.</p>
          )}
        </div>
      </section>

      <footer className="active-print-footer" style={{ fontSize: `${footerPt}pt`, color: '#475569' }}>
        Printed: {moment().format('DD-MMM-YYYY')}
      </footer>
    </div>
  );
}

function ActiveVendorsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [printVendor, setPrintVendor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'vendorName', direction: 'asc' });
  const [showNoDocumentsOnly, setShowNoDocumentsOnly] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reports/vendors/active');
        if (!res.ok) throw new Error('Failed to fetch active vendors');
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  useEffect(() => {
    if (!printVendor) return;
    const timer = setTimeout(() => {
      window.print();
      setPrintVendor(null);
    }, 350);
    return () => clearTimeout(timer);
  }, [printVendor]);

  const vendors = report?.vendors || [];

  const displayedVendors = useMemo(() => {
    let items = [...vendors];

    if (showNoDocumentsOnly) {
      items = items.filter((v) => v.hasNoDocuments);
      items.sort((a, b) => (b.poCount || 0) - (a.poCount || 0));
      return items;
    }

    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (key === 'poCount') return ((a.poCount || 0) - (b.poCount || 0)) * dir;
      if (key === 'docCount') {
        return ((a.documents?.length || 0) - (b.documents?.length || 0)) * dir;
      }
      if (key === 'lastPoDate') {
        const da = a.lastPoDate ? new Date(a.lastPoDate).getTime() : 0;
        const db = b.lastPoDate ? new Date(b.lastPoDate).getTime() : 0;
        return (da - db) * dir;
      }
      const aVal = String(a[key] || '');
      const bVal = String(b[key] || '');
      return aVal.localeCompare(bVal) * dir;
    });
    return items;
  }, [vendors, sortConfig, showNoDocumentsOnly]);

  const noDocumentsCount = useMemo(
    () => vendors.filter((v) => v.hasNoDocuments).length,
    [vendors]
  );

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: key === 'docCount' ? 'desc' : 'asc' };
      }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <FiArrowUp className="inline ml-1" />
    ) : (
      <FiArrowDown className="inline ml-1" />
    );
  };

  const printScale = printVendor
    ? getActiveVendorPrintFontScale({
        docCount: printVendor.documents?.length || 0,
      })
    : 1;

  const printStyles = `
    @media print {
      @page { size: A4 portrait; margin: 1cm 1.2cm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      body > *:not(.active-print-section) { display: none !important; }
      .active-print-section {
        display: block !important;
        visibility: visible !important;
        position: static;
        width: 100%;
        background: white;
      }
      .active-print-page {
        display: flex;
        flex-direction: column;
        min-height: 25.7cm;
        max-height: 25.7cm;
        overflow: hidden;
        page-break-after: always;
        page-break-inside: avoid;
        box-sizing: border-box;
      }
      .active-print-page:last-child { page-break-after: auto; }
      .active-print-header {
        flex-shrink: 0;
        margin-bottom: 0.5cm;
        padding-bottom: 0.3cm;
        border-bottom: 2px solid #cbd5e1;
      }
      .active-print-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
      }
      .active-print-footer {
        flex-shrink: 0;
        margin-top: 0.4cm;
        padding-top: 0.25cm;
        border-top: 1px solid #94a3b8;
      }
    }
    @media screen {
      .active-print-section { display: none; }
    }
  `;

  return (
    <>
      <style jsx global>{printStyles}</style>

      <div className="min-h-screen bg-gray-50 no-print">
        <HeaderNewComponent />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Vendors</h1>
              <p className="text-sm text-gray-600 mt-1">
                Vendors with at least one purchase order on or after 01-Jan-2020. Print A4 sheets with
                pre-qualification documents.
              </p>
            </div>

            <div className="flex flex-col items-stretch lg:items-end gap-3 lg:max-w-md">
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showNoDocumentsOnly}
                    onClick={() => setShowNoDocumentsOnly((prev) => !prev)}
                    className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
                      showNoDocumentsOnly ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        showNoDocumentsOnly ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      Show only vendors without documents
                    </span>
                    <span className="text-xs text-gray-600 mt-1 block leading-relaxed">
                      When ON: lists active vendors with no uploaded documents, sorted by PO count
                      (highest first). When OFF: shows all active vendors using your column sort.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading active vendors...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {showNoDocumentsOnly ? (
                  <>
                    Showing vendors without documents:{' '}
                    <span className="font-semibold">{displayedVendors.length}</span>
                    <span className="text-gray-500"> of {noDocumentsCount} total with no documents</span>
                  </>
                ) : (
                  <>
                    Total active vendors: <span className="font-semibold">{report?.totalCount || 0}</span>
                  </>
                )}
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('vendorCode')}
                        >
                          Vendor Code <SortIndicator columnKey="vendorCode" />
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('vendorName')}
                        >
                          Vendor Name <SortIndicator columnKey="vendorName" />
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('poCount')}
                        >
                          PO Count <SortIndicator columnKey="poCount" />
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort('lastPoDate')}
                        >
                          Last PO Date <SortIndicator columnKey="lastPoDate" />
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                            showNoDocumentsOnly ? '' : 'cursor-pointer hover:bg-gray-100'
                          }`}
                          onClick={() => !showNoDocumentsOnly && requestSort('docCount')}
                        >
                          Docs <SortIndicator columnKey="docCount" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluated</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedVendors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                            {showNoDocumentsOnly
                              ? 'No active vendors without documents.'
                              : 'No active vendors found.'}
                          </td>
                        </tr>
                      ) : (
                        displayedVendors.map((vendor) => (
                          <tr key={vendor.vendorCode} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.vendorCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{vendor.vendorName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{vendor.poCount}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {vendor.lastPoDate ? moment(vendor.lastPoDate).format('DD-MMM-YYYY') : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {vendor.documents?.length > 0 ? vendor.documents.length : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {vendor.evaluation ? 'Yes' : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setPrintVendor(vendor)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <FiPrinter className="mr-1" />
                                Print
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <FooterComponent />
      </div>

      {typeof document !== 'undefined' &&
        printVendor &&
        createPortal(
          <div className="active-print-section">
            <ActiveVendorPrintPage vendor={printVendor} scale={printScale} />
          </div>,
          document.body
        )}
    </>
  );
}

export default ActiveVendorsPage;
