import React, { useState } from 'react';
import { useRouter } from 'next/router';
import HeaderComponent from '../../../components/HeaderComponent';
import { FiArrowLeft } from 'react-icons/fi';

// Import PO Schedule components
import GeneralPOData from '../../../components/POSchedule/GeneralPOData';
import PaymentScheduleData from '../../../components/POSchedule/PaymentScheduleData';
import BankGuaranteeData from '../../../components/POSchedule/BankGuaranteeData';
import LCData from '../../../components/POSchedule/LCData';
import ProgressMilestoneData from '../../../components/POSchedule/ProgressMilestoneData';
import ShipmentData from '../../../components/POSchedule/ShipmentData';

function ViewPO() {
  const router = useRouter();
  const { ponumber } = router.query;
  const [activeTab, setActiveTab] = useState('general');

  const handleBack = () => {
    router.back();
  };

  if (!ponumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600">No PO number provided.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">PO Details: {ponumber}</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Schedule
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bank'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bank Guarantee
              </button>
              <button
                onClick={() => setActiveTab('lc')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lc'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                LC
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shipping
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <GeneralPOData ponumber={ponumber} />
            )}
            {activeTab === 'payment' && (
              <PaymentScheduleData ponumber={ponumber} />
            )}
            {activeTab === 'bank' && (
              <BankGuaranteeData ponumber={ponumber} />
            )}
            {activeTab === 'lc' && (
              <LCData ponumber={ponumber} />
            )}
            {activeTab === 'progress' && (
              <ProgressMilestoneData ponumber={ponumber} />
            )}
            {activeTab === 'shipping' && (
              <ShipmentData ponumber={ponumber} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewPO; 