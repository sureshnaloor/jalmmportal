import React from "react";
import { useRouter } from "next/router";
import HeaderComponent from "../../components/HeaderNewComponent";
import Vendorevaluationfixednew from "../../components/Vendordetailed/Vendorevaluationfixednew";
import Vendorevaluationyear2024 from "../../components/Vendordetailed/Vendorevaluationyear2024new";
import Vendorevaluationpastyears from "../../components/Vendordetailed/vendorevaluationpastyearsnew";
import Vendorcompletecontacts from "../../components/Vendordetailed/Vendorcontacts";

function Vendorevaluation1() {
  const router = useRouter();
  const { vendornumber } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <HeaderComponent />
      
      {/* Header Image */}
      <div className="relative pb-4 mb-4 overflow-hidden rounded-lg shadow-lg cursor-pointer m-4 dark:bg-gray-600 duration-300 ease-in-out transition-transform transform hover:-translate-y-1">
        <img
          className="object-cover w-full h-8"
          src="/images/hardhat.jpg"
          alt="hardhat"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-6 py-6 space-y-6">
        
        {/* Fixed Parameters Section - Pre-2023 Evaluation */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-6 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-1">Pre-2023 Evaluation</h2>
              <p className="text-blue-600 text-xs">Fixed parameters and historical assessment</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-blue-100">
            <Vendorevaluationfixednew vendornumber={vendornumber} />
          </div>
        </div>

        {/* 2024 Evaluation Section */}
        <div className="bg-gradient-to-r from-stone-50 to-zinc-50 rounded-xl shadow-lg border-2 border-green-200 p-6 mb-6 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-900 mb-1">2024 Evaluation</h2>
              <p className="text-green-600 text-xs">Current year PO-wise variable parameters</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-green-100">
            <div className="flex justify-center align-middle mb-4">
              <h4 className="py-2 px-6 text-xs shadow-md shadow-green-200 mx-auto bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-bold italic tracking-wider rounded-full border border-green-200">
                Variable yearly PO-wise parameters for vendor: {vendornumber} for year 2024
              </h4>
            </div>
            <Vendorevaluationyear2024 vendornumber={vendornumber} />
          </div>
        </div>

        {/* Past Years Evaluation Section - New Evaluation or Re-evaluation */}
        <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-xl shadow-lg border-2 border-purple-200 p-6 mb-6 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-900 mb-1">New Evaluation or Re-evaluation for 2024</h2>
              <p className="text-purple-600 text-xs">Historical performance analysis and trend assessment</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-purple-100">
            <Vendorevaluationpastyears vendornumber={vendornumber} />
          </div>
        </div>

        {/* Vendor Contacts Section */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl shadow-lg border-2 border-gray-200 p-6 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3 shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Vendor Contacts</h2>
              <p className="text-gray-600 text-xs">Contact information and communication details</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <Vendorcompletecontacts vendornumber={vendornumber} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vendorevaluation1; 