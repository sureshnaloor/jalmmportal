import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import moment from "moment";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";

const DomesticPurchasesDetails = () => {
  const router = useRouter();
  const { materialKey, year } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!materialKey || !year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/reports/domestic-purchases/details?materialKey=${encodeURIComponent(materialKey)}&year=${encodeURIComponent(year)}`;
        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materialKey, year]);

  const formatCurrency = (value) => {
    if (value == null || value === "") return "—";
    const num = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return "—";
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatQuantity = (value) => {
    if (value == null || value === "") return "—";
    if (typeof value === "object" && value.$numberDecimal) return formatQuantity(value.$numberDecimal);
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return "—";
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const m = moment(d);
    return m.isValid() ? m.format("MMM D, YYYY") : "—";
  };

  if (!router.isReady || (materialKey && year && loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
        <FooterComponent />
      </div>
    );
  }

  if (!materialKey || !year) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Missing materialKey or year. Open this page from the report &quot;Details&quot; link.</p>
          <Link href="/domestic-purchases-report" className="text-blue-600 hover:underline mt-2 inline-block">Back to report</Link>
        </div>
        <FooterComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
          <Link href="/domestic-purchases-report" className="text-blue-600 hover:underline mt-2 inline-block">Back to report</Link>
        </div>
        <FooterComponent />
      </div>
    );
  }

  const items = data?.items ?? [];
  const label = year === "all" ? "All years" : year;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Material PO Details (45* Domestic) | MM Portal</title>
      </Head>
      <HeaderComponent />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/domestic-purchases-report" className="text-blue-600 hover:underline text-sm mb-2 inline-block">← Back to 45 Series Domestic Purchases Report</Link>
            <h1 className="text-2xl font-bold text-gray-900">Material PO Details (45* Domestic)</h1>
            <p className="text-gray-600 mt-1">
              Material: <span className="font-medium text-gray-900">{data?.materialKey ?? materialKey}</span> · Period: {label}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PO Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor Name</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Value (SAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No PO line items found for this material.</td>
                  </tr>
                ) : (
                  items.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/purchaseorders/${encodeURIComponent(row.ponumber)}`} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                          {row.ponumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(row.podate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.vendorcode ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate" title={row.vendorname}>{row.vendorname ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(row.unitRate)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{formatQuantity(row.quantity)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(row.valueSar)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <FooterComponent />
    </div>
  );
};

export default DomesticPurchasesDetails;
