import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HeaderComponent from '../../../components/HeaderComponent';
import { FiArrowLeft, FiAlertTriangle, FiCalendar, FiClock, FiShield, FiFileText } from 'react-icons/fi';
import moment from 'moment';

// Import PO Schedule components
import GeneralPOData from '../../../components/POSchedule/GeneralPOData';
import PaymentScheduleData from '../../../components/POSchedule/PaymentScheduleData';
import BankGuaranteeData from '../../../components/POSchedule/BankGuaranteeData';
import LCData from '../../../components/POSchedule/LCData';
import ProgressMilestoneData from '../../../components/POSchedule/ProgressMilestoneData';
import ShipmentData from '../../../components/POSchedule/ShipmentData';

function ViewPOFromAlert() {
  const router = useRouter();
  const { ponumber } = router.query;
  const [activeTab, setActiveTab] = useState('general');
  const [poDetails, setPoDetails] = useState(null);
  const [deliveryAlerts, setDeliveryAlerts] = useState([]);
  const [bgAlerts, setBgAlerts] = useState([]);
  const [lcAlerts, setLcAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPODetails = async () => {
      if (!ponumber) return;
      
      try {
        setLoading(true);
        
        // Fetch delivery alerts
        const deliveryResponse = await fetch(`/api/reports/purchaseorders/deliverydatepassed`);
        if (deliveryResponse.ok) {
          const deliveryData = await deliveryResponse.json();
          const selectedDeliveryPO = deliveryData.find(po => po.ponumber === ponumber);
          setDeliveryAlerts(selectedDeliveryPO ? selectedDeliveryPO.daysOverdue : []);
        }

        // Fetch BG alerts
        const bgResponse = await fetch(`/api/reports/purchaseorders/bankguaranteealerts`);
        if (bgResponse.ok) {
          const bgData = await bgResponse.json();
          const selectedBGPO = bgData.find(po => po.ponumber === ponumber);
          setBgAlerts(selectedBGPO ? selectedBGPO.daysOverdue : []);
        }

        // Fetch LC alerts
        const lcResponse = await fetch(`/api/reports/purchaseorders/lcalerts`);
        if (lcResponse.ok) {
          const lcData = await lcResponse.json();
          const selectedLCPO = lcData.find(po => po.ponumber === ponumber);
          setLcAlerts(selectedLCPO ? [selectedLCPO.lcAlert] : []);
        }

        // Set PO details from any available data
        const deliveryResponse2 = await fetch(`/api/reports/purchaseorders/deliverydatepassed`);
        const bgResponse2 = await fetch(`/api/reports/purchaseorders/bankguaranteealerts`);
        const lcResponse2 = await fetch(`/api/reports/purchaseorders/lcalerts`);
        
        if (deliveryResponse2.ok && bgResponse2.ok && lcResponse2.ok) {
          const deliveryData = await deliveryResponse2.json();
          const bgData = await bgResponse2.json();
          const lcData = await lcResponse2.json();
          
          const deliveryPO = deliveryData.find(po => po.ponumber === ponumber);
          const bgPO = bgData.find(po => po.ponumber === ponumber);
          const lcPO = lcData.find(po => po.ponumber === ponumber);
          
          // Use whichever data is available
          const selectedPO = deliveryPO || bgPO || lcPO;
          setPoDetails(selectedPO);
        }
        
      } catch (err) {
        console.error('Error fetching PO details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPODetails();
  }, [ponumber]);

  const handleBack = () => {
    router.back();
  };

  const getSeverityColor = (daysOverdue) => {
    if (daysOverdue <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (daysOverdue <= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSeverityIcon = (daysOverdue) => {
    if (daysOverdue <= 7) return 'text-yellow-500';
    if (daysOverdue <= 30) return 'text-orange-500';
    return 'text-red-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading PO details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center text-red-600">
              <FiAlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasDeliveryAlerts = deliveryAlerts.length > 0;
  const hasBGAlerts = bgAlerts.length > 0;
  const hasLCAlerts = lcAlerts.length > 0;
  const hasAnyAlerts = hasDeliveryAlerts || hasBGAlerts || hasLCAlerts;

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
                Back to Alert Report
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PO Details: {ponumber}</h1>
                <p className="text-sm text-gray-600">
                  {hasAnyAlerts ? 'Multiple Alerts' : 'PO Information'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Alert Summary */}
        {hasAnyAlerts && (
          <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiAlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      PO Alert Summary
                    </h3>
                    <p className="text-sm text-gray-600">
                      This PO has multiple alerts that require attention
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Alert Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {moment().format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendor</p>
                  <p className="text-sm text-gray-900">{poDetails?.poDetails?.vendorname || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{poDetails?.poDetails?.vendorcode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Plant</p>
                  <p className="text-sm text-gray-900">{poDetails?.poDetails?.plant || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Value</p>
                  <p className="text-sm text-gray-900">
                    {poDetails?.poDetails?.openvalue ? 
                      `${poDetails.poDetails.openvalue.toLocaleString()} SAR` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                  <div className="space-y-1">
                    {hasDeliveryAlerts && (
                      <div className="flex items-center">
                        <FiCalendar className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          Delivery Date Alert ({deliveryAlerts.length})
                        </span>
                      </div>
                    )}
                    {hasBGAlerts && (
                      <div className="flex items-center">
                        <FiShield className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="text-sm font-medium text-orange-600">
                          Bank Guarantee Alert ({bgAlerts.length})
                        </span>
                      </div>
                    )}
                    {hasLCAlerts && (
                      <div className="flex items-center">
                        <FiFileText className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium text-blue-600">
                          LC Alert ({lcAlerts.length})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert Details */}
              {(hasDeliveryAlerts || hasBGAlerts || hasLCAlerts) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Alert Details:</h4>
                  <div className="space-y-2">
                    {hasDeliveryAlerts && deliveryAlerts.map((alert, idx) => (
                      <div key={`delivery-${idx}`} className="flex items-center">
                        <FiCalendar className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm text-gray-900">
                          {alert.field === 'podelydate' ? 'PO Delivery' : 'Estimated Delivery'}: 
                          {moment(alert.date).format('MMM D, YYYY')} 
                          ({alert.daysOverdue} days overdue)
                        </span>
                      </div>
                    ))}
                    {hasBGAlerts && bgAlerts.map((alert, idx) => (
                      <div key={`bg-${idx}`} className="flex items-center">
                        <FiShield className="h-4 w-4 mr-2 text-orange-500" />
                        <span className="text-sm text-gray-900">
                          {alert.type} Expiry: {moment(alert.expirydate).format('MMM D, YYYY')} 
                          ({alert.daysOverdue} days overdue)
                        </span>
                      </div>
                    ))}
                    {hasLCAlerts && lcAlerts.map((alert, idx) => (
                      <div key={`lc-${idx}`} className="flex items-center">
                        <FiFileText className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm text-gray-900">
                          LC Expiry: {moment(alert.expirydate).format('MMM D, YYYY')} 
                          ({alert.isExpired ? `${alert.daysOverdue} days expired` : `${alert.daysUntilExpiry} days left`})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

export default ViewPOFromAlert; 