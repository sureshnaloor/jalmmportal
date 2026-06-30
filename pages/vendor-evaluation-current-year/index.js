import React, { useEffect, useState, useMemo, useCallback } from 'react';

import { useRouter } from 'next/router';

import { getSession, useSession } from 'next-auth/react';

import moment from 'moment';

import HeaderComponent from '../../components/HeaderNewComponent';

import FooterComponent from '../../components/FooterComponent';

import ApprovalModal from '../../components/VendorEvaluation/ApprovalModal';

import { FiSearch, FiArrowUp, FiArrowDown, FiChevronRight, FiPrinter, FiCheck, FiEdit3 } from 'react-icons/fi';

import { getVendorEvaluationYear } from '../../lib/vendorEvaluationYear';
import { isSupplyChainHead } from '../../lib/vendorEvaluationApproval';



function VendorEvaluationCurrentYearList() {

  const router = useRouter();
  const { data: session } = useSession();
  const evaluationYear = getVendorEvaluationYear();
  const isSch = isSupplyChainHead(session?.user?.email);

  const [vendors, setVendors] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'totalValue', direction: 'desc' });

  const [approvalTarget, setApprovalTarget] = useState(null);
  const [notEvaluatedOnly, setNotEvaluatedOnly] = useState(false);



  const fetchVendors = useCallback(async () => {

    setLoading(true);

    try {

      const res = await fetch('/api/vendors/annual-evaluation');

      const data = await res.json();

      setVendors(data.vendors || []);

    } catch (err) {

      console.error(err);

    }

    setLoading(false);

  }, []);



  useEffect(() => {

    fetchVendors();

  }, [fetchVendors]);



  const requestSort = (key) => {

    setSortConfig((prev) => ({

      key,

      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',

    }));

  };



  const SortIndicator = ({ columnKey }) => {

    if (sortConfig.key !== columnKey) return null;

    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;

  };



  const filtered = useMemo(() => {
    let rows = [...vendors];

    if (notEvaluatedOnly) {
      rows = rows.filter((v) => !v.evaluated);
    }

    if (searchTerm) {

      const q = searchTerm.toLowerCase();

      rows = rows.filter(

        (v) =>

          String(v.vendorcode).toLowerCase().includes(q) ||

          (v.vendorname || '').toLowerCase().includes(q)

      );

    }

    rows.sort((a, b) => {

      let aVal = a[sortConfig.key];

      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'vendorcode') {

        aVal = String(a.vendorcode);

        bVal = String(b.vendorcode);

      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;

      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;

      return 0;

    });

    return rows;

  }, [vendors, searchTerm, sortConfig, notEvaluatedOnly]);



  const evaluatedCount = vendors.filter((v) => v.evaluated).length;
  const approvedCount = vendors.filter((v) => v.approved).length;
  const pendingCount = vendors.filter((v) => !v.evaluated).length;



  const renderScoreSummary = (v) => {
    if (v.fixedOverall == null && v.variableOverall == null) return null;
    return (
      <div className="text-xs text-gray-600 mb-1.5 leading-relaxed">
        {v.fixedOverall != null && (
          <span>
            Fixed: <span className="font-semibold text-amber-700">{v.fixedOverall}/5</span>
          </span>
        )}
        {v.fixedOverall != null && v.variableOverall != null && <span className="mx-1 text-gray-300">·</span>}
        {v.variableOverall != null && (
          <span>
            PO: <span className="font-semibold text-rose-700">{v.variableOverall}%</span>
          </span>
        )}
      </div>
    );
  };

  const renderStatus = (v) => {

    if (v.approved) {

      return (

        <>

          {renderScoreSummary(v)}

          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">

            Approved

          </span>

          {v.approvedAt && (

            <div className="text-xs text-gray-400 mt-1">{moment(v.approvedAt).format('DD MMM YYYY')}</div>

          )}

        </>

      );

    }

    if (v.evaluated) {

      return (

        <>

          {renderScoreSummary(v)}

          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">

            Evaluated

          </span>

          {v.evaluatedAt && (

            <div className="text-xs text-gray-400 mt-1">{moment(v.evaluatedAt).format('DD MMM YYYY')}</div>

          )}

        </>

      );

    }

    return (

      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">

        Pending

      </span>

    );

  };



  const renderActions = (v) => {

    if (v.approved) {

      return (

        <div className="flex flex-wrap items-center gap-2">

          <button

            type="button"

            disabled

            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"

          >

            <FiCheck className="mr-1" /> Approved

          </button>

          <button

            type="button"

            onClick={() => window.open(`/vendor-evaluation-current-year/${v.vendorcode}/print`, '_blank')}

            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"

          >

            <FiPrinter className="mr-1" /> Print PDF

          </button>

        </div>

      );

    }



    if (v.evaluated) {

      return (

        <div className="flex flex-wrap items-center gap-2">

          {isSch && (

            <button

              type="button"

              onClick={() => router.push(`/vendor-evaluation-current-year/${v.vendorcode}?editScores=1`)}

              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"

            >

              <FiEdit3 className="mr-1" /> Edit Score

            </button>

          )}

          <button

            type="button"

            onClick={() => setApprovalTarget({ vendorcode: v.vendorcode, vendorname: v.vendorname })}

            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700"

          >

            Approve <FiChevronRight className="ml-1" />

          </button>

        </div>

      );

    }



    return (

      <button

        type="button"

        onClick={() => router.push(`/vendor-evaluation-current-year/${v.vendorcode}`)}

        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"

      >

        Evaluate <FiChevronRight className="ml-1" />

      </button>

    );

  };



  return (

    <div className="min-h-screen bg-gray-50 flex flex-col">

      <HeaderComponent />

      <ApprovalModal

        vendorcode={approvalTarget?.vendorcode}

        vendorname={approvalTarget?.vendorname}

        open={Boolean(approvalTarget)}

        onClose={() => setApprovalTarget(null)}

        onApproved={fetchVendors}

      />

      <main className="container mx-auto px-4 py-8 flex-1">

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900">Vendor Evaluation — Current Year</h1>

          <p className="text-sm text-gray-600 mt-1">

            Evaluating vendors with POs issued in <strong>{evaluationYear}</strong> (total PO value &gt; 10,000 SAR).

            This year updates automatically each January.

          </p>

        </div>



        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">

            <p className="text-sm text-gray-600">Evaluation Year</p>

            <p className="text-2xl font-bold text-blue-800">{evaluationYear}</p>

          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">

            <p className="text-sm text-gray-600">Eligible Vendors</p>

            <p className="text-2xl font-bold text-indigo-800">{vendors.length}</p>

          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">

            <p className="text-sm text-gray-600">Evaluated</p>

            <p className="text-2xl font-bold text-green-800">{evaluatedCount} / {vendors.length}</p>

          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">

            <p className="text-sm text-gray-600">Approved</p>

            <p className="text-2xl font-bold text-emerald-800">{approvedCount} / {vendors.length}</p>

          </div>

        </div>



        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm shrink-0">
            <span className="text-sm font-medium text-gray-700">Not evaluated only</span>
            <button
              type="button"
              role="switch"
              aria-checked={notEvaluatedOnly}
              onClick={() => setNotEvaluatedOnly((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                notEvaluatedOnly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notEvaluatedOnly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            {notEvaluatedOnly && (
              <span className="text-xs text-amber-700 font-medium">{pendingCount} pending</span>
            )}
          </label>

          <div className="relative flex-1 max-w-2xl">

            <input

              type="text"

              placeholder="Search vendor code or name…"

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="w-full pl-11 pr-4 py-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:border-blue-500"

            />

            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>



        {loading ? (

          <div className="flex justify-center py-16">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />

          </div>

        ) : (

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('vendorcode')}>

                      Vendor Code <SortIndicator columnKey="vendorcode" />

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('vendorname')}>

                      Vendor Name <SortIndicator columnKey="vendorname" />

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('poCount')}>

                      PO Count <SortIndicator columnKey="poCount" />

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('totalValue')}>

                      Total PO Value (SAR) <SortIndicator columnKey="totalValue" />

                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {filtered.map((v) => (

                    <tr key={v.vendorcode} className="hover:bg-gray-50">

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">

                        <button

                          type="button"

                          onClick={() => router.push(`/vendor-evaluation-current-year/${v.vendorcode}`)}

                          className="text-blue-700 hover:underline"

                        >

                          {v.vendorcode}

                        </button>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">{v.vendorname}</td>

                      <td className="px-6 py-4 text-sm text-gray-600">{v.poCount}</td>

                      <td className="px-6 py-4 text-sm text-gray-600">{v.totalValue?.toLocaleString()}</td>

                      <td className="px-6 py-4">{renderStatus(v)}</td>

                      <td className="px-6 py-4">{renderActions(v)}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {filtered.length === 0 && (

              <p className="text-center text-gray-500 py-12">
                {notEvaluatedOnly
                  ? 'No pending vendors — all eligible vendors have been evaluated.'
                  : 'No vendors match your search.'}
              </p>

            )}

          </div>

        )}

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



export default VendorEvaluationCurrentYearList;

