import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

function Vendorevaluationfixednew({ vendornumber }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // State for vendor details and evaluation data
  const [vendordetails, setVendordetails] = useState({});
  const [vendorevaled, setVendorevaled] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // State for new evaluation scores
  const [newScores, setNewScores] = useState({
    quotation: null,
    paymentTerms: null,
    quality: null,
    technicalClarity: null,
    salesmanInteraction: null
  });

  // Fetch vendor details and evaluation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsResult, evalResult] = await Promise.all([
          fetch(`/api/vendors/vendordetails/${vendornumber}`),
          fetch(`/api/vendors/vendorevalfixed/${vendornumber}`)
        ]);

        const detailsJson = await detailsResult.json();
        const evalJson = await evalResult.json();

        setVendordetails(detailsJson);
        setVendorevaled(evalJson);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load vendor data');
      } finally {
        setIsLoading(false);
      }
    };

    if (vendornumber) {
      fetchData();
    }
  }, [vendornumber]);

  // Calculate total score
  const calculateTotalScore = () => {
    return Object.values(newScores).reduce((sum, score) => sum + (score || 0), 0);
  };

  // Handle score submission
  const handleSubmit = async () => {
    try {
      const body = {
        fixedeval: [
          newScores.quotation,
          newScores.paymentTerms,
          newScores.quality,
          newScores.technicalClarity,
          newScores.salesmanInteraction
        ],
        createdBy: session?.user?.name,
        createdAt: new Date()
      };

      const response = await fetch(`/api/vendors/vendorevalfixed/${vendornumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to submit evaluation');

      toast.success(`Evaluation for vendor ${vendornumber} completed successfully!`);
      router.reload();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast.error('Failed to submit evaluation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Vendor Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <h1 className="text-lg font-bold text-blue-900 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Vendor Evaluation: {vendornumber}
        </h1>
        <p className="text-blue-700 font-medium text-sm mb-2">
          {vendordetails["vendor-name"]}
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-white rounded-md p-2 shadow-sm">
            <span className="text-blue-600 font-medium">Country:</span> {vendordetails?.address?.countrycode}
          </div>
          <div className="bg-white rounded-md p-2 shadow-sm">
            <span className="text-blue-600 font-medium">City:</span> {vendordetails?.address?.city}
          </div>
          <div className="bg-white rounded-md p-2 shadow-sm">
            <span className="text-blue-600 font-medium">Address:</span> {vendordetails?.address?.street}
          </div>
        </div>
      </div>

      {/* Evaluation Grid - 3 Column Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pre-2023 Evaluation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-md">
          <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pre-2023 Evaluation
          </h2>
          {vendorevaled["fixedevalyear1"] ? (
            <div className="space-y-2">
              {/* Quotation Submission */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">📋 Quotation</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear1"]["fixedeval"][0] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear1"]["fixedeval"][0] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear1"]["fixedeval"][0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">💰 Payment</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear1"]["fixedeval"][1] === 20 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear1"]["fixedeval"][1] === 10 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear1"]["fixedeval"][1]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Certification */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">🏆 Quality</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear1"]["fixedeval"][2] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear1"]["fixedeval"][2] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear1"]["fixedeval"][2]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Clarity */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">📚 Technical</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear1"]["fixedeval"][3] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear1"]["fixedeval"][3] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear1"]["fixedeval"][3]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salesman Interaction */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">👥 Salesman</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear1"]["fixedeval"][4] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear1"]["fixedeval"][4] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear1"]["fixedeval"][4]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-md border border-blue-100">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-blue-600 font-medium text-xs">No pre-2023 evaluation found</p>
            </div>
          )}
        </div>

        {/* 2024 Evaluation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-md">
          <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            2024 Evaluation
          </h2>
          {vendorevaled["fixedevalyear2024"] ? (
            <div className="space-y-2">
              {/* Quotation Submission */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">📋 Quotation</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear2024"]["fixedeval"][0] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear2024"]["fixedeval"][0] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear2024"]["fixedeval"][0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">💰 Payment</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear2024"]["fixedeval"][1] === 20 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear2024"]["fixedeval"][1] === 10 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear2024"]["fixedeval"][1]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Certification */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">🏆 Quality</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear2024"]["fixedeval"][2] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear2024"]["fixedeval"][2] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear2024"]["fixedeval"][2]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Clarity */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">📚 Technical</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear2024"]["fixedeval"][3] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear2024"]["fixedeval"][3] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear2024"]["fixedeval"][3]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salesman Interaction */}
              <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium text-xs">👥 Salesman</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vendorevaled["fixedevalyear2024"]["fixedeval"][4] === 3 ? 'bg-green-500 text-white' :
                      vendorevaled["fixedevalyear2024"]["fixedeval"][4] === 2 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {vendorevaled["fixedevalyear2024"]["fixedeval"][4]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-white rounded-md border border-blue-100">
              <svg className="w-8 h-8 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-blue-600 font-medium text-xs">No 2024 evaluation found</p>
            </div>
          )}
        </div>

        {/* New Evaluation Form */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-md">
          <h2 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Evaluation 2024
          </h2>
          <div className="space-y-2">
            {/* Quotation Submission */}
            <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1">
                📋 Quotation
              </label>
              <select
                className="w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-xs"
                value={newScores.quotation || ''}
                onChange={(e) => setNewScores({...newScores, quotation: Number(e.target.value)})}
              >
                <option value="">Select rating</option>
                <option value="1">Rarely submits (1)</option>
                <option value="2">Submits after reminders (2)</option>
                <option value="3">Always submits timely (3)</option>
              </select>
            </div>

            {/* Payment Terms */}
            <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1">
                💰 Payment
              </label>
              <select
                className="w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-xs"
                value={newScores.paymentTerms || ''}
                onChange={(e) => setNewScores({...newScores, paymentTerms: Number(e.target.value)})}
              >
                <option value="">Select rating</option>
                <option value="5">Full advance required (5)</option>
                <option value="10">Partial credit terms (10)</option>
                <option value="20">Liberal credit terms (20)</option>
              </select>
            </div>

            {/* Quality Certification */}
            <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1">
                🏆 Quality
              </label>
              <select
                className="w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-xs"
                value={newScores.quality || ''}
                onChange={(e) => setNewScores({...newScores, quality: Number(e.target.value)})}
              >
                <option value="">Select rating</option>
                <option value="1">No certification (1)</option>
                <option value="2">In-house QMS (2)</option>
                <option value="3">ISO certified (3)</option>
              </select>
            </div>

            {/* Technical Clarity */}
            <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1">
                📚 Technical
              </label>
              <select
                className="w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-xs"
                value={newScores.technicalClarity || ''}
                onChange={(e) => setNewScores({...newScores, technicalClarity: Number(e.target.value)})}
              >
                <option value="">Select rating</option>
                <option value="1">Poor documentation (1)</option>
                <option value="2">Needs follow-up (2)</option>
                <option value="3">Excellent documentation (3)</option>
              </select>
            </div>

            {/* Salesman Interaction */}
            <div className="bg-white rounded-md p-2 shadow-sm border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1">
                👥 Salesman
              </label>
              <select
                className="w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-xs"
                value={newScores.salesmanInteraction || ''}
                onChange={(e) => setNewScores({...newScores, salesmanInteraction: Number(e.target.value)})}
              >
                <option value="">Select rating</option>
                <option value="1">Difficult to reach (1)</option>
                <option value="2">Responsive remotely (2)</option>
                <option value="3">Frequently visits (3)</option>
              </select>
            </div>

            {/* Total Score and Submit Button */}
            <div className="mt-3 pt-3 border-t border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-800">Total Score:</span>
                <span className="text-lg font-bold text-blue-600 bg-white px-2 py-1 rounded-md shadow-sm">
                  {calculateTotalScore()}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={Object.values(newScores).some(score => score === null)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-3 rounded-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-300 font-bold text-xs"
              >
                🚀 Submit Evaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vendorevaluationfixednew; 