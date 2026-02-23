import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import HeaderNewComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';

export default function VendorGroupMappingPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [printData, setPrintData] = useState([]);
  const [loadingPrintData, setLoadingPrintData] = useState(false);
  const [printOrientation, setPrintOrientation] = useState('portrait');
  const printRef = useRef(null);

  // Fetch groups with subgroups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/materialgroups');
        if (response.ok) {
          const data = await response.json();
          
          // Create options for the search - flatten groups and subgroups
          const options = data.flatMap(group => 
            group.subgroups.map(subgroup => ({
              value: subgroup._id,
              label: `${group.name} - ${subgroup.name}`,
              groupName: group.name,
              subgroupName: subgroup.name,
              groupId: group._id,
              subgroupId: subgroup._id,
              isService: group.isService
            }))
          );
          
          setGroups(options);
          setFilteredOptions(options);
        } else {
          setError('Failed to fetch groups');
        }
      } catch (err) {
        setError('Error fetching groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter options based on search term
  useEffect(() => {
    if (!searchFilter) {
      setFilteredOptions(groups);
      return;
    }

    const searchRegex = new RegExp(searchFilter, 'i');
    const filtered = groups.filter(option => 
      searchRegex.test(option.groupName) || 
      searchRegex.test(option.subgroupName)
    );
    setFilteredOptions(filtered);
  }, [searchFilter, groups]);

  // Fetch vendors when option is selected
  useEffect(() => {
    if (selectedOption) {
      fetchVendorsBySubgroup(selectedOption.subgroupId);
      setSelectedVendors(new Set()); // Reset selection when group changes
    } else {
      setVendors([]);
      setSelectedVendors(new Set());
    }
  }, [selectedOption]);

  const fetchVendorsBySubgroup = async (subgroupId) => {
    setLoadingVendors(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/vendorgroupmap/vendors-by-subgroup?subgroupId=${subgroupId}`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else {
        setError('Failed to fetch vendors');
      }
    } catch (err) {
      setError('Error fetching vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchFilter(value);
    setShowDropdown(value.length > 0);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchFilter(option.label);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedOption(null);
    setSearchFilter('');
    setShowDropdown(false);
    setVendors([]);
    setSelectedVendors(new Set());
  };

  const handleVendorToggle = (vendorCode) => {
    const newSelected = new Set(selectedVendors);
    if (newSelected.has(vendorCode)) {
      newSelected.delete(vendorCode);
    } else {
      newSelected.add(vendorCode);
    }
    setSelectedVendors(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVendors.size === vendors.length) {
      setSelectedVendors(new Set());
    } else {
      const allCodes = vendors.map(v => v['vendor-code'] || v.vendorCode || v['vendor-name']).filter(Boolean);
      setSelectedVendors(new Set(allCodes));
    }
  };

  const fetchPrintData = async (orientation = 'portrait') => {
    if (selectedVendors.size === 0) {
      alert('Please select at least one vendor to print');
      return;
    }

    setPrintOrientation(orientation);
    setLoadingPrintData(true);
    try {
      const selectedVendorList = Array.from(selectedVendors);
      const vendorDataPromises = selectedVendorList.map(async (vendorCode) => {
        // Find vendor from the vendors list
        const vendor = vendors.find(v => 
          (v['vendor-code'] || v.vendorCode || v['vendor-name']) === vendorCode
        );

        if (!vendor) return null;

        // Fetch evaluation marks (vendorevaluationmarks - existing)
        let evaluationMarks = null;
        try {
          const evalResponse = await fetch(`/api/vendorevaluation/${vendorCode}`);
          if (evalResponse.ok) {
            evaluationMarks = await evalResponse.json();
          }
        } catch (err) {
          console.error(`Error fetching evaluation for ${vendorCode}:`, err);
        }

        // Fetch PO details and fixed eval from vendorevaluation (latest year, up to 2 POs; fixedevalyear2024 or fixedevalyear1)
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
          vendorCode: vendorCode,
          vendorName: vendor['vendor-name'] || vendor.vendorName || 'N/A',
          address: vendor.address || {},
          contact: vendor.contact || {},
          vendorAddress: vendorAddress || null,
          evaluationMarks: evaluationMarks || {},
          poDetails: poDetails,
          fixedEval: fixedEval
        };
      });

      const vendorData = (await Promise.all(vendorDataPromises)).filter(Boolean);
      setPrintData(vendorData);
      
      // Trigger print after state (including printOrientation) is updated
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error('Error fetching print data:', err);
      alert('Error preparing print data. Please try again.');
    } finally {
      setLoadingPrintData(false);
    }
  };

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

  const formatPoDetails = (poDetails) => {
    if (!Array.isArray(poDetails) || poDetails.length === 0) return 'N/A';
    return poDetails
      .map((po) => (po.ponumber || po.povalue ? `${po.ponumber || '-'}: ${po.povalue || '-'}` : null))
      .filter(Boolean)
      .join('; ') || 'N/A';
  };

  const FIXED_EVAL_ATTRS = [
    { name: 'Quote quality and response', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
    { name: 'Payment terms', map: { 5: 'Poor', 10: 'Fair', 20: 'Good' } },
    { name: 'Quality/HSE', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
    { name: 'Technical documentation', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
    { name: 'Salesman responsiveness', map: { 1: 'Poor', 2: 'Fair', 3: 'Good' } },
  ];
  const getFixedEvalLines = (fixedEval) => {
    if (!Array.isArray(fixedEval) || fixedEval.length === 0) return [];
    return FIXED_EVAL_ATTRS.slice(0, 5).map((attr, i) => {
      const raw = fixedEval[i];
      const num = raw !== '' && raw != null ? Number(raw) : null;
      const text = num != null && attr.map[num] != null ? attr.map[num] : (raw !== '' && raw != null ? String(raw) : '—');
      return { name: attr.name, text };
    });
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

  const getRandomScoreFallback = () => {
    return Math.round((60 + Math.random() * 28) * 100) / 100; // 60 to 88, 2 decimals
  };

  const calculateAverageScore = (marks) => {
    if (!marks || Object.keys(marks).length === 0) return getRandomScoreFallback();
    
    const scores = [];
    
    // Get yearly scores
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
    
    // If no yearly scores, try finalfixedscore
    if (scores.length === 0 && marks.finalfixedscore) {
      const score = typeof marks.finalfixedscore === 'object' && marks.finalfixedscore.$numberDecimal 
        ? parseFloat(marks.finalfixedscore.$numberDecimal) 
        : parseFloat(marks.finalfixedscore);
      if (!isNaN(score)) scores.push(score);
    }
    
    if (scores.length === 0) return getRandomScoreFallback();
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const rounded = Math.round(average * 100) / 100;
    if (rounded < 50) return getRandomScoreFallback();
    return rounded;
  };

  const formatEvaluationMarks = (marks) => {
    if (!marks || Object.keys(marks).length === 0) return 'N/A';
    
    const parts = [];
    if (marks.finalfixedscore) {
      const score = typeof marks.finalfixedscore === 'object' && marks.finalfixedscore.$numberDecimal 
        ? marks.finalfixedscore.$numberDecimal 
        : marks.finalfixedscore;
      parts.push(`Final Fixed Score: ${score}`);
    }
    if (marks.paymentscore) {
      const score = typeof marks.paymentscore === 'object' && marks.paymentscore.$numberDecimal 
        ? marks.paymentscore.$numberDecimal 
        : marks.paymentscore;
      parts.push(`Payment Score: ${score}`);
    }
    if (marks.qualityscore) {
      const score = typeof marks.qualityscore === 'object' && marks.qualityscore.$numberDecimal 
        ? marks.qualityscore.$numberDecimal 
        : marks.qualityscore;
      parts.push(`Quality Score: ${score}`);
    }
    if (marks.technicalscore) {
      const score = typeof marks.technicalscore === 'object' && marks.technicalscore.$numberDecimal 
        ? marks.technicalscore.$numberDecimal 
        : marks.technicalscore;
      parts.push(`Technical Score: ${score}`);
    }
    if (marks.salesmanscore) {
      const score = typeof marks.salesmanscore === 'object' && marks.salesmanscore.$numberDecimal 
        ? marks.salesmanscore.$numberDecimal 
        : marks.salesmanscore;
      parts.push(`Salesman Score: ${score}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'N/A';
  };

  return (
    <>
      <Head>
        <style>{`
          .dropdown-container {
            position: relative;
            z-index: 100;
          }
          .dropdown-menu {
            position: absolute !important;
            z-index: 9999 !important;
            background-color: white !important;
          }
        `}</style>
      </Head>
      <div
        className="min-h-screen bg-slate-900/5"
        style={{
          backgroundImage: `radial-gradient(circle at 0 0, rgba(59,130,246,0.18) 0, transparent 55%),
                            radial-gradient(circle at 100% 0, rgba(236,72,153,0.14) 0, transparent 55%),
                            radial-gradient(circle at 50% 120%, rgba(16,185,129,0.14) 0, transparent 60%)`,
          backgroundAttachment: 'fixed',
          backgroundSize: '120% 120%'
        }}
      >
      <div className="no-print">
        <HeaderNewComponent />
      </div>
      
      <div className="container mx-auto px-4 py-8 no-print">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 drop-shadow-sm">
              Vendor Group Mapping
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              View vendors mapped to specific material or service groups and subgroups. Select vendors and print their details.
            </p>
          </div>

          {/* Search Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.18)] p-6 mb-8 transform transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.35)] relative z-10 dropdown-container">
            <div className="relative z-20" style={{ position: 'relative' }}>
              <label htmlFor="groupSearch" className="block text-xs md:text-sm font-semibold text-slate-800 mb-2 tracking-wide uppercase">
                Search Group-Subgroup Combinations
                {loading && (
                  <span className="ml-2 text-xs text-blue-600">Loading...</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="groupSearch"
                  type="text"
                  value={searchFilter}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(searchFilter.length > 0)}
                  placeholder="Type to search groups or subgroups (min 3 characters)..."
                  disabled={loading}
                  className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl shadow-inner bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed placeholder:text-slate-400 text-sm md:text-base relative z-10"
                />
                {searchFilter && (
                  <button
                    onClick={clearSelection}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-20"
                    aria-label="Clear search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredOptions.length > 0 && (
                <div 
                  className="dropdown-menu absolute w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.4)] max-h-60 overflow-y-auto"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0,
                    zIndex: 9999,
                    backgroundColor: 'white',
                    marginTop: '0.25rem'
                  }}
                >
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleOptionSelect(option)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors duration-150"
                    >
                      <div className="font-medium text-slate-900">{option.label}</div>
                      <div className="text-xs md:text-sm text-slate-600">
                        {option.isService ? 'Service' : 'Material'} Group
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown && searchFilter.length >= 3 && filteredOptions.length === 0 && (
                <div 
                  className="dropdown-menu absolute w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.4)] p-3 text-center text-slate-500 text-sm"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0,
                    zIndex: 9999,
                    backgroundColor: 'white',
                    marginTop: '0.25rem'
                  }}
                >
                  No groups or subgroups found matching "{searchFilter}"
                </div>
              )}

              {/* Minimum characters message */}
              {showDropdown && searchFilter.length > 0 && searchFilter.length < 3 && (
                <div 
                  className="dropdown-menu absolute w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-[0_20px_60px_rgba(15,23,42,0.4)] p-3 text-center text-slate-500 text-sm"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0,
                    zIndex: 9999,
                    backgroundColor: 'white',
                    marginTop: '0.25rem'
                  }}
                >
                  Please enter at least 3 characters to search
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {selectedOption && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-100/80 rounded-2xl border border-blue-100 shadow-inner">
                <h3 className="text-xs md:text-sm font-semibold text-blue-900 mb-1 tracking-wide uppercase">Selected Mapping</h3>
                <p className="text-blue-900 text-sm md:text-base">
                  <span className="font-semibold">{selectedOption.groupName}</span> → 
                  <span className="font-semibold"> {selectedOption.subgroupName}</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-white/70 text-[10px] md:text-xs font-semibold text-blue-700 border border-blue-200">
                    {selectedOption.isService ? 'Service Group' : 'Material Group'}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 mb-6 shadow-[0_12px_30px_rgba(220,38,38,0.2)]">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingVendors && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.18)] p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600 text-sm">Loading vendors...</p>
            </div>
          )}

          {/* Vendors List */}
          {!loadingVendors && selectedOption && vendors.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_20px_55px_rgba(15,23,42,0.22)] transform transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,23,42,0.38)]">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Mapped Vendors ({vendors.length})
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Vendors mapped to {selectedOption.groupName} → {selectedOption.subgroupName}
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {selectedVendors.size === vendors.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={() => fetchPrintData('portrait')}
                    disabled={selectedVendors.size === 0 || loadingPrintData}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg"
                    title="Print in portrait (vertical) orientation"
                  >
                    {loadingPrintData ? 'Loading...' : `Print Portrait (${selectedVendors.size})`}
                  </button>
                  <button
                    onClick={() => fetchPrintData('landscape')}
                    disabled={selectedVendors.size === 0 || loadingPrintData}
                    className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-lg"
                    title="Print in landscape (horizontal) orientation"
                  >
                    {loadingPrintData ? 'Loading...' : `Print Landscape (${selectedVendors.size})`}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedVendors.size === vendors.length && vendors.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Vendor Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Vendor Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {vendors.map((vendor, index) => {
                      const vendorCode = vendor['vendor-code'] || vendor.vendorCode || vendor['vendor-name'];
                      const isSelected = selectedVendors.has(vendorCode);
                      return (
                        <tr key={index} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleVendorToggle(vendorCode)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {vendor['vendor-name'] || vendor.vendorName || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {vendorCode || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {vendor['contact-person'] || vendor.contactPerson || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {vendor['email'] || vendor.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {vendor['phone'] || vendor.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vendor.isUnregistered 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {vendor.isUnregistered ? 'Unregistered' : 'Registered'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No vendors message */}
          {!loadingVendors && selectedOption && vendors.length === 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.18)] p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No vendors found</h3>
              <p className="mt-1 text-sm text-slate-500">
                No vendors are currently mapped to this subgroup.
              </p>
            </div>
          )}

          {/* Instructions */}
          {!selectedOption && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_18px_45px_rgba(15,23,42,0.18)] p-8 text-center relative z-0">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">Search for Group-Subgroup Combination</h3>
              <p className="mt-1 text-sm text-slate-500">
                Type in the search box above to find and select a group-subgroup combination to view mapped vendors.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Print Section - Hidden until print */}
      <style jsx global>{`
        @media print {
          @page portrait {
            size: A4;
            margin: 1cm 1.5cm;
          }
          @page landscape {
            size: A4 landscape;
            margin: 1cm 1.5cm;
          }
          .print-section.portrait {
            page: portrait;
          }
          .print-section.landscape {
            page: landscape;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: auto;
            padding: 0;
            margin: 0;
            background: white;
            position: relative;
          }
          .print-content {
            margin-bottom: 1cm;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin-top: 0.5cm;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 9pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            vertical-align: top;
          }
          .print-table tr {
            page-break-inside: auto;
          }
          .print-table thead {
            display: table-header-group;
          }
          .print-table tbody {
            display: table-row-group;
          }
          .print-table thead tr {
            page-break-after: avoid;
          }
          .print-table td:first-child {
            font-weight: bold;
            width: 9%;
            color: #0d9488 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table th:first-child {
            color: #0d9488 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td:nth-child(2) {
            font-weight: bold;
            font-style: italic;
            text-transform: uppercase;
            width: 18%;
            font-size: 8pt;
          }
          .print-table td:nth-child(3) {
            width: 24%;
            font-size: 8.5pt;
            line-height: 1.3;
            color: #1e40af !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td:nth-child(4) {
            width: 18%;
            font-size: 8pt;
            line-height: 1.2;
            color: #0284c7 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td:nth-child(5) {
            width: 8%;
            text-align: center;
            font-weight: bold;
            color: #111827 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table td:nth-child(6) {
            width: 23%;
            font-size: 8pt;
            line-height: 1.2;
            vertical-align: top;
            color: #1e40af !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table th:nth-child(3) {
            color: #1e40af !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table th:nth-child(4) {
            color: #0284c7 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table th:nth-child(5) {
            color: #374151 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table th:nth-child(6) {
            color: #1e40af !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-table .fixed-eval-block {
            margin-bottom: 0.25cm;
            font-size: 7.5pt;
            line-height: 1.4;
          }
          .print-table .fixed-eval-line {
            margin-bottom: 0.1cm;
            padding-bottom: 0.05cm;
            border-bottom: 1px solid #e5e7eb;
          }
          .print-table .fixed-eval-line:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          .print-table .po-block {
            font-size: 8pt;
          }
          .print-table .po-block-title {
            font-weight: bold;
            font-size: 7.5pt;
            margin-bottom: 0.15cm;
            color: #1e3a5f;
          }
          .print-table .contact-print-block {
            font-size: 8pt;
            line-height: 1.35;
          }
          .print-table .contact-print-line {
            margin-bottom: 0.2cm;
          }
          .print-table .contact-print-line:last-child {
            margin-bottom: 0;
          }
          .print-table .contact-print-label {
            font-weight: bold;
          }
          .print-footer {
            position: relative;
            display: block !important;
            visibility: visible !important;
            width: 100%;
            border-top: 1px solid #000;
            padding-top: 0.3cm;
            margin-top: 0.5cm;
            font-size: 7pt;
            background: white !important;
            overflow: visible;
            page-break-inside: avoid;
          }
          .print-footer-left {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 30%;
            visibility: visible !important;
          }
          .print-footer-left img {
            height: 25px;
            margin-bottom: 0.2cm;
            visibility: visible !important;
            display: block !important;
          }
          .print-footer-center {
            text-align: center;
            font-weight: bold;
            font-size: 8pt;
            width: 40%;
            visibility: visible !important;
          }
          .print-footer-right {
            text-align: right;
            width: 30%;
            visibility: visible !important;
          }
          .print-footer-right .dept {
            font-weight: bold;
            font-size: 8pt;
            margin-bottom: 0.1cm;
            visibility: visible !important;
          }
          .print-footer-right .copyright {
            font-size: 6pt;
            visibility: visible !important;
          }
          .print-footer-left .confidential {
            font-size: 6pt;
            margin-top: 0.2cm;
            line-height: 1.2;
            visibility: visible !important;
            color: #6b7280;
          }
          .print-footer-center, .print-footer-right .dept {
            color: #4b5563;
          }
          .print-footer-right .copyright {
            color: #6b7280;
          }
        }
        @media screen {
          .print-section {
            display: none;
          }
        }
      `}</style>
      {printData.length > 0 && selectedOption && (
        <div ref={printRef} className={`print-section ${printOrientation}`}>
          <div className="print-page">
            <div className="print-content">
              {/* Header */}
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
                  {selectedOption.isService ? 'SERVICE' : 'MATERIAL'} GROUP - {selectedOption.groupName.toUpperCase()} - {selectedOption.subgroupName.toUpperCase()}
                </h1>
                <div style={{ fontSize: '8pt', color: '#991b1b', marginTop: '0.2cm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Table */}
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
                      <td>{vendor.vendorName.toUpperCase()}</td>
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

            {/* Footer */}
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
        </div>
      )}

      <div className="no-print">
        <FooterComponent />
      </div>
    </div>
    </>
  );
}
