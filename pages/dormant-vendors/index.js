import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import HeaderNewComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { FiPrinter, FiArrowUp, FiArrowDown, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { getPrintFontScale } from '../../lib/dormantVendorsReport';

function formatCurrency(value) {
  return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatScore(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toFixed(2);
}

function DormantVendorPrintPage({ vendor, scale }) {
  const basePt = 10 * scale;
  const sectionPt = 11 * scale;
  const codePt = 22 * scale;
  const namePt = 18 * scale;
  const footerPt = 8 * scale;

  const lastPoLabel = vendor.lastPoDate
    ? moment(vendor.lastPoDate).format('DD-MMM-YYYY')
    : 'No PO on record';

  return (
    <div className="dormant-print-page">
      <header className="dormant-print-header">
        <div style={{ fontSize: `${codePt}pt`, fontWeight: 'bold', lineHeight: 1.15, color: '#0f172a' }}>
          {vendor.vendorCode}
        </div>
        <div style={{ fontSize: `${namePt}pt`, fontWeight: 'bold', lineHeight: 1.2, marginTop: '0.15cm', color: '#1e293b' }}>
          {vendor.vendorName || '—'}
        </div>
      </header>

      <div className="dormant-print-columns">
        <section className="dormant-print-main">
          <div style={{ marginBottom: '0.3cm' }}>
            {vendor.purchaseOrders.length === 0 ? (
              <p style={{ fontSize: `${basePt}pt`, color: '#64748b', margin: 0 }}>No purchase orders on record.</p>
            ) : (
              <table className="dormant-print-table" style={{ fontSize: `${basePt}pt` }}>
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>PO Date</th>
                    <th>PO Value (SAR)</th>
                    <th>Balance (SAR)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.purchaseOrders.map((po) => (
                    <tr key={po.ponum}>
                      <td>{po.ponum}</td>
                      <td>{po.podate ? moment(po.podate).format('DD-MMM-YYYY') : '—'}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(po.poval)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(po.balgrval)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginBottom: '0.3cm' }}>
            <div style={{ fontSize: `${sectionPt}pt`, fontWeight: 'bold', marginBottom: '0.1cm', color: '#0f172a' }}>
              Pre Qualification Documents
            </div>
            {vendor.documents?.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '0.4cm', fontSize: `${basePt}pt`, lineHeight: 1.3 }}>
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

          <div>
            <div style={{ fontSize: `${sectionPt}pt`, fontWeight: 'bold', marginBottom: '0.1cm', color: '#0f172a' }}>
              Evaluation Marks
            </div>
            {vendor.evaluation ? (
              <div style={{ fontSize: `${basePt}pt`, lineHeight: 1.35 }}>
                {vendor.evaluation.finalfixedscore != null && (
                  <div>Final fixed score: {formatScore(vendor.evaluation.finalfixedscore)}</div>
                )}
                {vendor.evaluation.finalscore2022 != null && (
                  <div>Year 2022 score: {formatScore(vendor.evaluation.finalscore2022)}</div>
                )}
                {vendor.evaluation.finalscore2023 != null && (
                  <div>Year 2023 score: {formatScore(vendor.evaluation.finalscore2023)}</div>
                )}
                {vendor.evaluation.finalscore2024 != null && (
                  <div>Year 2024 score: {formatScore(vendor.evaluation.finalscore2024)}</div>
                )}
                {vendor.evaluation.pastYears?.map((p) => (
                  <div key={p.year}>
                    Past year {p.year}: {formatScore(p.score)}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: `${basePt}pt`, color: '#64748b', margin: 0 }}>Not evaluated.</p>
            )}
          </div>
        </section>

        <aside className="dormant-print-remarks" style={{ fontSize: `${basePt}pt` }}>
          <div style={{ fontSize: `${sectionPt}pt`, fontWeight: 'bold', marginBottom: '0.12cm', color: '#0f172a' }}>
            Remarks
          </div>
          <p style={{ fontSize: `${8 * scale}pt`, color: '#64748b', margin: '0 0 0.15cm', lineHeight: 1.3 }}>
            Comments / reasons why this vendor did not receive any PO after 01-Jan-2020:
          </p>
          <div className="dormant-print-remarks-box" />

          <div className="dormant-print-signature-block">
            <div className="dormant-print-signature-row">
              <span className="dormant-print-signature-label">Buyer signature</span>
              <span className="dormant-print-signature-line" />
            </div>
            <div className="dormant-print-signature-row">
              <span className="dormant-print-signature-label">Department Head / Supply Chain Head signature</span>
              <span className="dormant-print-signature-line" />
            </div>
          </div>
        </aside>
      </div>

      <footer className="dormant-print-footer" style={{ fontSize: `${footerPt}pt`, color: '#475569' }}>
        <div>Printed: {moment().format('DD-MMM-YYYY')}</div>
        <div>Last PO issued: {lastPoLabel}</div>
      </footer>
    </div>
  );
}

function DormantVendorsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [printVendor, setPrintVendor] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'vendorName', direction: 'asc' });
  const [showWithPoOnly, setShowWithPoOnly] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reports/vendors/dormant');
        if (!res.ok) throw new Error('Failed to fetch dormant vendors');
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

  const sortedVendors = useMemo(() => {
    let items = [...vendors];

    if (showWithPoOnly) {
      items = items.filter((v) => (v.poCount || 0) > 0);
    }

    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (key === 'poCount') return ((a.poCount || 0) - (b.poCount || 0)) * dir;
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
  }, [vendors, sortConfig, showWithPoOnly]);

  const withPoCount = useMemo(
    () => vendors.filter((v) => (v.poCount || 0) > 0).length,
    [vendors]
  );

  const zeroPoCount = useMemo(
    () => vendors.filter((v) => (v.poCount || 0) === 0).length,
    [vendors]
  );

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <FiArrowUp className="inline ml-1" />
    ) : (
      <FiArrowDown className="inline ml-1" />
    );
  };

  const toggleExpanded = (vendorCode) => {
    setExpanded((prev) => ({ ...prev, [vendorCode]: !prev[vendorCode] }));
  };

  const handlePrint = (vendor) => {
    setPrintVendor(vendor);
  };

  const printScale = printVendor
    ? getPrintFontScale({
        poCount: printVendor.poCount || 0,
        docCount: printVendor.documents?.length || 0,
        hasEvaluation: !!printVendor.evaluation,
      })
    : 1;

  const printStyles = `
    @media print {
      @page { size: A4 portrait; margin: 1cm 1.2cm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none !important; }
      body > *:not(.dormant-print-section) { display: none !important; }
      .dormant-print-section {
        display: block !important;
        visibility: visible !important;
        position: static;
        width: 100%;
        background: white;
      }
      .dormant-print-page {
        display: flex;
        flex-direction: column;
        min-height: 25.7cm;
        max-height: 25.7cm;
        overflow: hidden;
        page-break-after: always;
        page-break-inside: avoid;
        box-sizing: border-box;
      }
      .dormant-print-page:last-child { page-break-after: auto; }
      .dormant-print-header {
        flex-shrink: 0;
        margin-bottom: 0.35cm;
        padding-bottom: 0.25cm;
        border-bottom: 2px solid #cbd5e1;
      }
      .dormant-print-columns {
        flex: 1 1 auto;
        display: flex;
        gap: 0.4cm;
        min-height: 0;
        overflow: hidden;
      }
      .dormant-print-main {
        flex: 1 1 62%;
        min-width: 0;
        overflow: hidden;
      }
      .dormant-print-remarks {
        flex: 0 0 34%;
        display: flex;
        flex-direction: column;
        border: 1px solid #94a3b8;
        border-radius: 2px;
        padding: 0.25cm 0.3cm;
        box-sizing: border-box;
        min-height: 0;
      }
      .dormant-print-remarks-box {
        flex: 1 1 auto;
        min-height: 5cm;
        border: 1px dashed #cbd5e1;
        background: #fafafa;
        margin-bottom: 0.35cm;
      }
      .dormant-print-signature-block {
        flex-shrink: 0;
        margin-top: auto;
      }
      .dormant-print-signature-row {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.45cm;
      }
      .dormant-print-signature-row:last-child {
        margin-bottom: 0;
      }
      .dormant-print-signature-label {
        font-size: 8pt;
        font-weight: 600;
        color: #334155;
        margin-bottom: 0.12cm;
        line-height: 1.25;
      }
      .dormant-print-signature-line {
        display: block;
        border-bottom: 1px solid #475569;
        min-height: 0.7cm;
        width: 100%;
      }
      .dormant-print-footer {
        flex-shrink: 0;
        margin-top: 0.35cm;
        padding-top: 0.2cm;
        border-top: 1px solid #94a3b8;
        line-height: 1.5;
      }
      .dormant-print-table {
        width: 100%;
        border-collapse: collapse;
      }
      .dormant-print-table th,
      .dormant-print-table td {
        border: 1px solid #94a3b8;
        padding: 3px 5px;
        text-align: left;
        vertical-align: top;
      }
      .dormant-print-table th {
        background: #f1f5f9 !important;
        font-weight: bold;
      }
    }
    @media screen {
      .dormant-print-section { display: none; }
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
              <h1 className="text-2xl font-bold text-gray-900">Dormant Vendors</h1>
              <p className="text-sm text-gray-600 mt-1">
                Vendors with no purchase orders since 01-Jan-2020. Historical POs, evaluation marks, and
                pre-qualification documents can be printed per vendor on a single A4 page.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm lg:max-w-md">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={showWithPoOnly}
                  onClick={() => setShowWithPoOnly((prev) => !prev)}
                  className={`relative flex-shrink-0 mt-0.5 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                    showWithPoOnly ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      showWithPoOnly ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
                <div>
                  <span className="text-sm font-medium text-gray-900 block">
                    Show only vendors with at least one PO
                  </span>
                  <span className="text-xs text-gray-600 mt-1 block leading-relaxed">
                    When ON: hides dormant vendors with zero purchase orders on record (only those with
                    historical POs before 2020 are listed). When OFF: shows all dormant vendors, including
                    those who never received any PO.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading dormant vendors...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {showWithPoOnly ? (
                  <>
                    Showing vendors with at least one PO:{' '}
                    <span className="font-semibold">{sortedVendors.length}</span>
                    <span className="text-gray-500"> of {withPoCount} total</span>
                    {zeroPoCount > 0 && (
                      <span className="text-gray-500"> ({zeroPoCount} with zero POs hidden)</span>
                    )}
                  </>
                ) : (
                  <>
                    Total dormant vendors: <span className="font-semibold">{report?.totalCount || 0}</span>
                    <span className="text-gray-500">
                      {' '}
                      ({withPoCount} with POs, {zeroPoCount} with zero POs)
                    </span>
                  </>
                )}
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 w-8" />
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Docs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluated</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Print</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedVendors.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                            {showWithPoOnly
                              ? 'No dormant vendors with historical purchase orders.'
                              : 'No dormant vendors found.'}
                          </td>
                        </tr>
                      ) : (
                        sortedVendors.map((vendor) => {
                          const isOpen = !!expanded[vendor.vendorCode];
                          return (
                            <React.Fragment key={vendor.vendorCode}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-3 py-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleExpanded(vendor.vendorCode)}
                                    className="text-gray-500 hover:text-gray-800"
                                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                                  >
                                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                                  </button>
                                </td>
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
                                    onClick={() => handlePrint(vendor)}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                  >
                                    <FiPrinter className="mr-1" />
                                    Print
                                  </button>
                                </td>
                              </tr>
                              {isOpen && (
                                <tr className="bg-slate-50">
                                  <td colSpan={8} className="px-6 py-4">
                                    {vendor.purchaseOrders.length === 0 ? (
                                      <p className="text-sm text-gray-500">No historical purchase orders.</p>
                                    ) : (
                                      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-white">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PO Number</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Vendor</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PO Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">PO Value (SAR)</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Balance (SAR)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                          {vendor.purchaseOrders.map((po) => (
                                            <tr key={po.ponum}>
                                              <td className="px-3 py-2">{po.ponum}</td>
                                              <td className="px-3 py-2">{po.vendorname || vendor.vendorName}</td>
                                              <td className="px-3 py-2">
                                                {po.podate ? moment(po.podate).format('DD-MMM-YYYY') : '—'}
                                              </td>
                                              <td className="px-3 py-2">{formatCurrency(po.poval)}</td>
                                              <td className="px-3 py-2">{formatCurrency(po.balgrval)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
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
          <div className="dormant-print-section">
            <DormantVendorPrintPage vendor={printVendor} scale={printScale} />
          </div>,
          document.body
        )}
    </>
  );
}

export default DormantVendorsPage;
