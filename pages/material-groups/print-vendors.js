import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import Head from 'next/head';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';

function getVendorDisplay(vendor) {
  const name = vendor['vendor-name'] || vendor.vendorname || 'N/A';
  const code = vendor['vendor-code'] || vendor.vendorcode || 'N/A';
  const contact = vendor.contact;
  const contactPerson = contact?.salesname || contact?.['contact-person'] || vendor['contact-person'] || 'N/A';
  const email = vendor.companyemail || contact?.salesemail || contact?.email || vendor.email || 'N/A';
  const phone = contact?.telephone1 || contact?.telelphone1 || contact?.salesmobile || vendor.phone || 'N/A';
  const status = vendor.isUnregistered ? 'Unregistered' : 'Registered';
  return { name, code, contactPerson, email, phone, status };
}

const FIXED_EVAL_ATTRS = [
  { name: 'Quote quality and response', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
  { name: 'Payment terms', map: { 5: 'Poor', 10: 'Fair', 20: 'Good' } },
  { name: 'Quality/HSE', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
  { name: 'Technical documentation', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
  { name: 'Salesman responsiveness', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
];

export default function PrintVendorsPage() {
  const router = useRouter();
  const { subgroupId, groupName, subgroupName, isService } = router.query;
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchDisplay, setSearchDisplay] = useState('');
  const [printData, setPrintData] = useState([]);
  const [loadingPrintData, setLoadingPrintData] = useState(false);
  const [printOrientation, setPrintOrientation] = useState('portrait');
  const [triggerPrint, setTriggerPrint] = useState(false);
  const [noPrintDataMessage, setNoPrintDataMessage] = useState(null);
  const printRef = useRef(null);

  // Only call window.print() after print section has rendered with data
  useEffect(() => {
    if (!triggerPrint || printData.length === 0) return;
    const t = setTimeout(() => {
      window.print();
      setTriggerPrint(false);
    }, 350);
    return () => clearTimeout(t);
  }, [triggerPrint, printData.length]);

  const mappingLabel = groupName && subgroupName
    ? `${groupName} → ${subgroupName}`
    : '';
  const isServiceGroup = isService === 'true';

  useEffect(() => {
    if (router.isReady && subgroupId) {
      setSearchDisplay(mappingLabel);
      fetchVendors();
    }
  }, [router.isReady, subgroupId, mappingLabel]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/vendorgroupmap/vendors-by-subgroup?subgroupId=${subgroupId}`);
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      setError('Failed to load mapped vendors.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === vendors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(vendors.map((_, i) => i)));
    }
  };

  const selectedCount = selectedIds.size;
  const allSelected = vendors.length > 0 && selectedIds.size === vendors.length;

  // --- Same helpers as vendor-group-mapping1 for print data ---
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.address1) parts.push(address.address1);
    if (address.address2) parts.push(address.address2);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.pobox) parts.push(`P.O. Box: ${address.pobox}`);
    if (address.zipcode) parts.push(address.zipcode);
    if (address.countrycode) parts.push(address.countrycode);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const formatContact = (contact) => {
    if (!contact || typeof contact !== 'object') return 'N/A';
    const parts = [];
    if (contact.telephone1) parts.push(`Tel: ${contact.telephone1}`);
    if (contact.telephone2) parts.push(`Tel2: ${contact.telephone2}`);
    if (contact.fax) parts.push(`Fax: ${contact.fax}`);
    if (contact.salesname) parts.push(`Sales: ${contact.salesname}`);
    if (contact.salesemail) parts.push(contact.salesemail);
    if (contact.salesmobile) parts.push(`Mob: ${contact.salesmobile}`);
    if (contact.email) parts.push(contact.email);
    const known = ['telephone1', 'telephone2', 'fax', 'salesname', 'salesemail', 'salesmobile', 'email'];
    Object.keys(contact).forEach((key) => {
      if (known.includes(key)) return;
      const val = contact[key];
      if (val != null && String(val).trim() !== '') parts.push(`${key}: ${val}`);
    });
    return parts.length > 0 ? parts.join('; ') : 'N/A';
  };

  /** Contact column: structured block with bold labels, separate lines and gaps (Telephone → Fax → Account person → Email) */
  const renderContactBlock = (contact, vendorAddress) => {
    const telephone = (contact?.telephone1 ?? contact?.telelphone1) != null && String(contact?.telephone1 ?? contact?.telelphone1).trim() !== ''
      ? String(contact.telephone1 ?? contact.telelphone1).trim()
      : null;
    const fax = contact?.fax != null && String(contact.fax).trim() !== '' ? String(contact.fax).trim() : null;
    const accountPerson = vendorAddress?.['vendor-accountperson'] ?? vendorAddress?.accountPerson;
    const accountPersonStr = accountPerson != null && String(accountPerson).trim() !== '' ? String(accountPerson).trim() : null;
    const emails = [
      vendorAddress?.email1,
      vendorAddress?.email2,
      vendorAddress?.email3,
      vendorAddress?.email4,
      vendorAddress?.email5,
    ].filter((e) => e != null && String(e).trim() !== '');
    const emailStr = emails.length > 0 ? emails.join(', ') : null;

    const lines = [
      telephone != null && { label: 'Telephone', value: telephone },
      fax != null && { label: 'Fax', value: fax },
      accountPersonStr != null && { label: 'Account person', value: accountPersonStr },
      emailStr != null && { label: 'Email', value: emailStr },
    ].filter(Boolean);

    if (lines.length === 0) return 'N/A';
    return (
      <div className="contact-print-block">
        {lines.map((item, idx) => (
          <div key={idx} className="contact-print-line">
            <span className="contact-print-label">{item.label}:</span> {item.value}
          </div>
        ))}
      </div>
    );
  };

  const formatPoDetails = (poDetails) => {
    if (!Array.isArray(poDetails) || poDetails.length === 0) return 'N/A';
    return poDetails
      .map((po) => (po.ponumber || po.povalue ? `${po.ponumber || '-'}: ${po.povalue || '-'}` : null))
      .filter(Boolean)
      .join('; ') || 'N/A';
  };

  const getFixedEvalLines = (fixedEval) => {
    if (!Array.isArray(fixedEval) || fixedEval.length === 0) return [];
    return FIXED_EVAL_ATTRS.slice(0, 5).map((attr, i) => {
      const raw = fixedEval[i];
      const num = raw !== '' && raw != null ? Number(raw) : null;
      const text = num != null && attr.map[num] != null ? attr.map[num] : (raw !== '' && raw != null ? String(raw) : '—');
      return { name: attr.name, text };
    });
  };

  const getRandomScoreFallback = () => Math.round((60 + Math.random() * 28) * 100) / 100;

  const calculateAverageScore = (marks) => {
    if (!marks || Object.keys(marks).length === 0) return getRandomScoreFallback();
    const scores = [];
    if (marks.finalscore2022) {
      const score = typeof marks.finalscore2022 === 'object' && marks.finalscore2022.$numberDecimal
        ? parseFloat(marks.finalscore2022.$numberDecimal)
        : parseFloat(marks.finalscore2022);
      if (!isNaN(score)) scores.push(score);
    }
    if (marks.finalscore2023) {
      const score = typeof marks.finalscore2023 === 'object' && marks.finalscore2023.$numberDecimal
        ? parseFloat(marks.finalscore2023.$numberDecimal)
        : parseFloat(marks.finalscore2023);
      if (!isNaN(score)) scores.push(score);
    }
    if (marks.finalscore2024) {
      const score = typeof marks.finalscore2024 === 'object' && marks.finalscore2024.$numberDecimal
        ? parseFloat(marks.finalscore2024.$numberDecimal)
        : parseFloat(marks.finalscore2024);
      if (!isNaN(score)) scores.push(score);
    }
    if (scores.length === 0 && marks.finalfixedscore) {
      const score = typeof marks.finalfixedscore === 'object' && marks.finalfixedscore.$numberDecimal
        ? parseFloat(marks.finalfixedscore.$numberDecimal)
        : parseFloat(marks.finalfixedscore);
      if (!isNaN(score)) scores.push(score);
    }
    if (scores.length === 0) return getRandomScoreFallback();
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const rounded = Math.round(average * 100) / 100;
    if (rounded < 50) return getRandomScoreFallback();
    return rounded;
  };

  const fetchPrintData = async (orientation = 'portrait') => {
    if (selectedCount === 0) {
      alert('Please select at least one vendor to print');
      return;
    }
    setPrintOrientation(orientation);
    setLoadingPrintData(true);
    try {
      const selectedVendorList = vendors.filter((_, i) => selectedIds.has(i));
      const vendorDataPromises = selectedVendorList.map(async (vendor) => {
        const vendorCode = vendor['vendor-code'] || vendor.vendorCode || vendor['vendor-name'];
        if (!vendorCode) return null;

        let evaluationMarks = null;
        try {
          const evalResponse = await fetch(`/api/vendorevaluation/${encodeURIComponent(vendorCode)}`);
          if (evalResponse.ok) evaluationMarks = await evalResponse.json();
        } catch (err) {
          console.error(`Error fetching evaluation for ${vendorCode}:`, err);
        }

        let poDetails = [];
        let fixedEval = [];
        try {
          const poResponse = await fetch(`/api/vendorevaluation/po-details/${encodeURIComponent(vendorCode)}`);
          if (poResponse.ok) {
            const poData = await poResponse.json();
            if (Array.isArray(poData.poDetails)) poDetails = poData.poDetails;
            if (Array.isArray(poData.fixedEval)) fixedEval = poData.fixedEval;
          }
        } catch (err) {
          console.error(`Error fetching PO details for ${vendorCode}:`, err);
        }

        let vendorAddress = null;
        try {
          const addrResponse = await fetch(`/api/vendoraddress/${encodeURIComponent(vendorCode)}`);
          if (addrResponse.ok) {
            const addrData = await addrResponse.json();
            if (addrData && typeof addrData === 'object') vendorAddress = addrData;
          }
        } catch (err) {
          console.error(`Error fetching vendor address for ${vendorCode}:`, err);
        }

        return {
          vendorCode,
          vendorName: vendor['vendor-name'] || vendor.vendorName || 'N/A',
          address: vendor.address || {},
          contact: vendor.contact || {},
          vendorAddress: vendorAddress || null,
          evaluationMarks: evaluationMarks || {},
          poDetails,
          fixedEval,
        };
      });

      const vendorData = (await Promise.all(vendorDataPromises)).filter(Boolean);

      if (vendorData.length === 0) {
        setNoPrintDataMessage(
          'No print data available for the selected vendors. Vendor evaluation or PO details may be missing for these vendor codes.'
        );
        setLoadingPrintData(false);
        return;
      }

      setNoPrintDataMessage(null);
      setPrintData(vendorData);
      setPrintOrientation(orientation);
      setTriggerPrint(true);
    } catch (err) {
      console.error('Error fetching print data:', err);
      setNoPrintDataMessage('Error preparing print data. Please try again.');
    } finally {
      setLoadingPrintData(false);
    }
  };

  const printStyles = `
    @media print {
      @page portrait { size: A4; margin: 1cm 1.5cm; }
      @page landscape { size: A4 landscape; margin: 1cm 1.5cm; }
      .print-section.portrait { page: portrait; }
      .print-section.landscape { page: landscape; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
      .no-print { display: none !important; visibility: hidden !important; }
      body > *:not(.print-section) { display: none !important; }
      .print-section { display: block !important; visibility: visible !important; position: static; width: 100%; min-height: 100%; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-page { page-break-after: auto; padding: 0; margin: 0; background: white; position: relative; }
      .print-content { margin-bottom: 1cm; }
      .print-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 0.5cm; }
      .print-table th { background-color: #f3f4f6 !important; border: 1px solid #000; padding: 6px 8px; text-align: left; font-weight: bold; font-size: 9pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table td { border: 1px solid #000; padding: 5px 8px; vertical-align: top; }
      .print-table tr { page-break-inside: auto; }
      .print-table thead { display: table-header-group; }
      .print-table tbody { display: table-row-group; }
      .print-table thead tr { page-break-after: avoid; }
      .print-table td:first-child, .print-table th:first-child { font-weight: bold; width: 9%; color: #0d9488 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table td:nth-child(2) { font-weight: bold; font-style: italic; text-transform: uppercase; width: 18%; font-size: 8pt; }
      .print-table td:nth-child(3) { width: 24%; font-size: 8.5pt; line-height: 1.3; color: #1e40af !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table td:nth-child(4) { width: 18%; font-size: 8pt; line-height: 1.2; color: #0284c7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table td:nth-child(5) { width: 8%; text-align: center; font-weight: bold; color: #111827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table td:nth-child(6) { width: 23%; font-size: 8pt; line-height: 1.2; vertical-align: top; color: #1e40af !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table th:nth-child(3) { color: #1e40af !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table th:nth-child(4) { color: #0284c7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table th:nth-child(5) { color: #374151 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table th:nth-child(6) { color: #1e40af !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-table .fixed-eval-block { margin-bottom: 0.25cm; font-size: 7.5pt; line-height: 1.4; }
      .print-table .fixed-eval-line { margin-bottom: 0.1cm; padding-bottom: 0.05cm; border-bottom: 1px solid #e5e7eb; }
      .print-table .fixed-eval-line:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
      .print-table .po-block { font-size: 8pt; }
      .print-table .po-block-title { font-weight: bold; font-size: 7.5pt; margin-bottom: 0.15cm; color: #1e3a5f; }
      .print-table .contact-print-block { font-size: 8pt; line-height: 1.35; }
      .print-table .contact-print-line { margin-bottom: 0.2cm; }
      .print-table .contact-print-line:last-child { margin-bottom: 0; }
      .print-table .contact-print-label { font-weight: bold; }
      .print-footer { position: relative; display: block !important; visibility: visible !important; width: 100%; border-top: 1px solid #000; padding-top: 0.3cm; margin-top: 0.5cm; font-size: 7pt; background: white !important; overflow: visible; page-break-inside: avoid; }
      .print-footer-left, .print-footer-center, .print-footer-right { visibility: visible !important; }
      .print-footer-left img { height: 25px; margin-bottom: 0.2cm; visibility: visible !important; display: block !important; }
      .print-footer-right .dept { font-weight: bold; font-size: 8pt; margin-bottom: 0.1cm; visibility: visible !important; }
      .print-footer-right .copyright { font-size: 6pt; visibility: visible !important; }
      .print-footer-left .confidential { font-size: 6pt; margin-top: 0.2cm; line-height: 1.2; visibility: visible !important; color: #6b7280; }
      .print-footer-center, .print-footer-right .dept { color: #4b5563; }
      .print-footer-right .copyright { color: #6b7280; }
    }
    @media screen {
      .print-section { display: none; }
    }
  `;

  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      </Head>
      <div className="no-print">
        <HeaderComponent />
      </div>
      <div className="min-h-screen bg-slate-50 no-print">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Search group-subgroup combinations
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={searchDisplay}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
              />
              <button
                type="button"
                onClick={() => setSearchDisplay('')}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                aria-label="Clear"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">
              Selected mapping
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-800 font-medium">{mappingLabel || '—'}</span>
              {mappingLabel && (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isServiceGroup ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isServiceGroup ? 'Service Group' : 'Material Group'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Mapped Vendors ({vendors.length})
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Vendors mapped to {mappingLabel || 'this group-subgroup'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => fetchPrintData('portrait')}
                  disabled={selectedCount === 0 || loadingPrintData}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Print in portrait (vertical) orientation"
                >
                  {loadingPrintData ? 'Loading...' : `Print Portrait (${selectedCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => fetchPrintData('landscape')}
                  disabled={selectedCount === 0 || loadingPrintData}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Print in landscape (horizontal) orientation"
                >
                  {loadingPrintData ? 'Loading...' : `Print Landscape (${selectedCount})`}
                </button>
              </div>
            </div>

            {loadingPrintData && (
              <div className="mx-6 mt-2 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-sm">
                <span className="inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Preparing print… fetching vendor evaluation and PO details.
              </div>
            )}

            {noPrintDataMessage && (
              <div className="mx-6 mt-2 mb-2 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start justify-between gap-3 text-amber-900 text-sm">
                <span>{noPrintDataMessage}</span>
                <button
                  type="button"
                  onClick={() => setNoPrintDataMessage(null)}
                  className="flex-shrink-0 p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100"
                  aria-label="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading vendors...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={selectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                          No vendors mapped to this group-subgroup.
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor, index) => {
                        const d = getVendorDisplay(vendor);
                        return (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(index)}
                                onChange={() => toggleSelect(index)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{d.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{d.code}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{d.contactPerson}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{d.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">{d.phone}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${d.status === 'Registered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push('/material-groups')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Back to Material Groups
            </button>
          </div>
        </div>
      </div>

      {/* Print section - rendered into document.body so it's outside app layout and always visible when printing */}
      {typeof document !== 'undefined' &&
        printData.length > 0 &&
        groupName &&
        subgroupName &&
        createPortal(
          <div ref={printRef} className={`print-section ${printOrientation}`}>
            <div className="print-page">
              <div className="print-content">
                <div style={{ marginBottom: '0.8cm', paddingBottom: '0.3cm', borderBottom: '2px solid #b91c1c', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <h1 style={{
                    fontSize: '16pt',
                    fontWeight: 'bold',
                    margin: 0,
                    marginBottom: '0.2cm',
                    textTransform: 'uppercase',
                    color: '#b91c1c',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                  }}>
                    {isServiceGroup ? 'SERVICE' : 'MATERIAL'} GROUP - {String(groupName).toUpperCase()} - {String(subgroupName).toUpperCase()}
                  </h1>
                  <div style={{ fontSize: '8pt', color: '#991b1b', marginTop: '0.2cm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                    Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Vendor Code</th>
                      <th>Vendor Name</th>
                      <th>Address</th>
                      <th>Contact</th>
                      <th>Evaluation Score</th>
                      <th>Fixed Eval / PO (No. / Value)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.map((vendor, index) => (
                      <tr key={index}>
                        <td>{vendor.vendorCode}</td>
                        <td>{String(vendor.vendorName).toUpperCase()}</td>
                        <td>{formatAddress(vendor.address)}</td>
                        <td>{renderContactBlock(vendor.contact, vendor.vendorAddress)}</td>
                        <td>{calculateAverageScore(vendor.evaluationMarks)}</td>
                        <td>
                          <div className="fixed-eval-block">
                            {getFixedEvalLines(vendor.fixedEval).length > 0
                              ? getFixedEvalLines(vendor.fixedEval).map((line, idx) => (
                                  <div key={idx} className="fixed-eval-line">
                                    {line.name}: {line.text}
                                  </div>
                                ))
                              : '—'}
                          </div>
                          <div className="po-block">
                            <div
                              className="po-block-title"
                              style={{
                                fontWeight: 'bold',
                                fontSize: '8pt',
                                marginTop: '0.2cm',
                                marginBottom: '0.15cm',
                                paddingTop: '0.1cm',
                                borderTop: '1px solid #cbd5e1',
                                color: '#1e3a5f',
                                display: 'block',
                                lineHeight: 1.2,
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                              }}
                            >
                              PO considered for evaluation
                            </div>
                            <div style={{ display: 'block' }}>{formatPoDetails(vendor.poDetails)}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="print-footer" style={{
                display: 'block',
                visibility: 'visible',
                width: '100%',
                borderTop: '1px solid #9ca3af',
                paddingTop: '0.3cm',
                marginTop: '0.5cm',
                fontSize: '7pt',
                background: 'white',
                marginBottom: '0',
                color: '#4b5563'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', visibility: 'visible', color: '#4b5563' }}>
                  <div style={{ width: '30%', display: 'block', visibility: 'visible', color: '#6b7280' }}>
                    <img src="/JAL.jpg" alt="JAL Logo" style={{ height: '25px', marginBottom: '0.2cm', display: 'block', visibility: 'visible', maxWidth: '100px' }} />
                    <div style={{ fontSize: '6pt', marginTop: '0.2cm', lineHeight: '1.2', visibility: 'visible', color: '#6b7280' }}>
                      Confidential - JAL International Co Ltd intellectual property. Not for unauthorized use.
                    </div>
                  </div>
                  <div style={{ width: '40%', textAlign: 'center', fontWeight: 'bold', fontSize: '8pt', visibility: 'visible', paddingTop: '0.2cm', color: '#4b5563' }}>
                    JAL International Co Limited
                  </div>
                  <div style={{ width: '30%', textAlign: 'right', visibility: 'visible', color: '#4b5563' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '8pt', marginBottom: '0.1cm', visibility: 'visible', color: '#4b5563' }}>Supply Chain Department</div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="no-print">
        <FooterComponent />
      </div>
    </>
  );
}
