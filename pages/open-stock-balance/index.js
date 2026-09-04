import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";
import OpenBalanceDataView from "../../components/OpenBalanceDataView";

const COLUMNS = [
  { key: "stock-type", label: "Stock Type", searchable: true, filterType: "select", cardTitle: false },
  { key: "material-code", label: "Material No.", searchable: true, searchPlaceholder: "Material number", linkTo: true, cardTitle: true },
  { key: "material-description", label: "Description", searchable: true, nowrap: false },
  { key: "material-group", label: "Mat. Group", searchable: true },
  { key: "plant-code", label: "Plant", searchable: true },
  { key: "unit-of-measure", label: "UoM" },
  { key: "stk-indicator", label: "Special Ind.", searchable: true, filterType: "select" },
  { key: "wbs-element", label: "Project WBS", searchable: true, searchPlaceholder: "WBS / project" },
  { key: "sales-doc", label: "Sales Document", searchable: true, searchPlaceholder: "Sales order" },
  { key: "sales-doc-no", label: "Sales Doc No.", searchable: true, card: false },
  { key: "on-hand-qty", label: "On-hand Qty", type: "number", align: "right" },
  { key: "on-hand-val", label: "On-hand Value (SAR)", type: "currency", align: "right" },
  { key: "current-stkqty", label: "Complete Qty", type: "number", align: "right", card: false },
  { key: "current-stkval", label: "Complete Value", type: "currency", align: "right", card: false },
  { key: "stock-qty", label: "Special Qty", type: "number", align: "right", card: false },
  { key: "stock-val", label: "Special Value", type: "currency", align: "right", card: false },
  { key: "receipt-qty", label: "Receipt Qty", type: "number", align: "right", card: false },
  { key: "issue-qty", label: "Issue Qty", type: "number", align: "right", card: false },
  { key: "stock-date", label: "Stock Date", type: "date" },
];

const DEFAULT_SORT = [
  { key: "material-code", direction: "asc" },
  { key: "plant-code", direction: "asc" },
  { key: "stock-type", direction: "asc" },
];

function formatSar(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "SAR" });
}

function OpenStockBalance() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [asOnDate, setAsOnDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/inventory/open-stock-balance");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load");
        if (cancelled) return;
        setRows(Array.isArray(data.rows) ? data.rows : []);
        setSummary(data.summary || null);
        setAsOnDate(data.asOnDate || null);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load open stock");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRowLink = (row, col) => {
    if (col.key === "material-code" && row["material-code"]) {
      return `/materials/${encodeURIComponent(row["material-code"])}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderComponent />
      <main className="container mx-auto px-4 py-8">
        <OpenBalanceDataView
          title="Open Stock Balance"
          subtitle={`Materials currently in complete-stock or special-stock${
            asOnDate ? ` — as on ${new Date(asOnDate).toLocaleString()}` : ""
          }. Default sort is material number, then plant, then stock type.`}
          columns={COLUMNS}
          rows={rows}
          loading={loading}
          error={error}
          defaultSort={DEFAULT_SORT}
          getRowKey={(row, index) => `${row._id || row["material-code"]}-${row["stock-type"]}-${index}`}
          onRowLink={onRowLink}
          emptyMessage="No in-stock materials match the current search."
          cardAccent="emerald"
          summaryItems={
            summary
              ? [
                  { label: "Stock rows", value: summary.rowCount?.toLocaleString?.() ?? summary.rowCount },
                  { label: "Complete-stock", value: summary.completeCount?.toLocaleString?.() ?? summary.completeCount },
                  { label: "Special-stock", value: summary.specialCount?.toLocaleString?.() ?? summary.specialCount },
                  { label: "On-hand value", value: formatSar(summary.totalValueSar) },
                ]
              : []
          }
        />
      </main>
      <FooterComponent />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return { props: { session } };
}

export default OpenStockBalance;
