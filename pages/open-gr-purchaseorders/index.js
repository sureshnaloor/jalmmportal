import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";
import OpenBalanceDataView from "../../components/OpenBalanceDataView";
import OpenGrPoClosePanel from "../../components/OpenGrPoClosePanel";

const COLUMNS = [
  { key: "po-number", label: "PO Number", searchable: true, searchPlaceholder: "e.g. 450000*", linkTo: true, cardTitle: true },
  { key: "po-line-item", label: "Line", searchable: true },
  { key: "po-date", label: "PO Date", type: "date" },
  { key: "delivery-date", label: "Delivery Date", type: "date" },
  { key: "vendorcode", label: "Vendor Code", searchable: true, searchPlaceholder: "Vendor code" },
  { key: "vendorname", label: "Vendor Name", searchable: true, nowrap: false },
  { key: "item-type", label: "Type", searchable: true, filterType: "select" },
  { key: "material.matcode", label: "Material No.", searchable: true, searchPlaceholder: "Material number", linkTo: true },
  { key: "material.matdescription", label: "Material / Service", searchable: true, nowrap: false },
  { key: "material.matgroup", label: "Mat. Group", searchable: true },
  { key: "plant-code", label: "Plant", searchable: true },
  { key: "po-quantity", label: "PO Qty", type: "number", align: "right" },
  { key: "po-unit-of-measure", label: "UoM" },
  { key: "pending-qty", label: "Pending Qty", type: "number", align: "right" },
  { key: "pending-val-sar", label: "Pending GR (SAR)", type: "currency", align: "right" },
  { key: "po-value-sar", label: "PO Value (SAR)", type: "currency", align: "right", card: false },
  { key: "po-unit-price", label: "Unit Price", type: "number", align: "right", card: false },
  { key: "currency", label: "Curr.", card: false },
  { key: "account.wbs", label: "Project WBS", searchable: true, searchPlaceholder: "WBS / project" },
  { key: "account.network", label: "Network", searchable: true },
  { key: "account.network-activity", label: "Network Act.", searchable: true, card: false },
  { key: "account.order", label: "Internal Order", searchable: true },
  { key: "account.costcenter", label: "Cost Center", searchable: true },
  { key: "account.salesdoc", label: "Sales Document", searchable: true, searchPlaceholder: "Sales order" },
  { key: "account.salesdoc-item", label: "SO Item", searchable: true, card: false },
];

const DEFAULT_SORT = [
  { key: "po-number", direction: "asc" },
  { key: "po-line-item", direction: "asc" },
];

function formatSar(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "SAR" });
}

function OpenGrPurchaseOrders() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [asOnDate, setAsOnDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closures, setClosures] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [poRes, closeRes] = await Promise.all([
          fetch("/api/purchaseorders/open-gr-balance"),
          fetch("/api/purchaseorders/open-gr-closures"),
        ]);
        const poData = await poRes.json();
        if (!poRes.ok) throw new Error(poData.error || "Failed to load");
        let closeData = { closures: {} };
        if (closeRes.ok) {
          closeData = await closeRes.json();
        }
        if (cancelled) return;
        setRows(Array.isArray(poData.rows) ? poData.rows : []);
        setSummary(poData.summary || null);
        setAsOnDate(poData.asOnDate || null);
        setClosures(closeData.closures || {});
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load open purchase orders");
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
    if (col.key === "po-number" && row["po-number"]) {
      return `/purchaseorders/${encodeURIComponent(row["po-number"])}`;
    }
    if (col.key === "material.matcode" && row["material.matcode"]) {
      return `/materials/${encodeURIComponent(row["material.matcode"])}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderComponent />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="container mx-auto px-4 py-8">
        <OpenBalanceDataView
          title="Open GR Purchase Orders"
          subtitle={`Line items still to be delivered (material or service)${
            asOnDate ? ` — as on ${new Date(asOnDate).toLocaleString()}` : ""
          }. Default sort is PO number, then line item. Lines of the same PO are grouped; mark a PO “to close” on the left.`}
          columns={COLUMNS}
          rows={rows}
          loading={loading}
          error={error}
          defaultSort={DEFAULT_SORT}
          getRowKey={(row, index) => `${row._id || row["po-number"]}-${row["po-line-item"]}-${index}`}
          onRowLink={onRowLink}
          emptyMessage="No open GR purchase order lines match the current search."
          cardAccent="blue"
          groupByKey="po-number"
          renderGroupSidebar={(group) => (
            <OpenGrPoClosePanel
              group={group}
              saved={closures[group.key] || null}
              onSaved={(doc) => {
                if (!doc?.ponumber) return;
                setClosures((prev) => ({ ...prev, [doc.ponumber]: doc }));
              }}
            />
          )}
          summaryItems={
            summary
              ? [
                  { label: "Open POs", value: summary.poCount?.toLocaleString?.() ?? summary.poCount },
                  { label: "Open line items", value: summary.lineCount?.toLocaleString?.() ?? summary.lineCount },
                  { label: "Pending GR value", value: formatSar(summary.pendingValueSar) },
                  { label: "PO value (open lines)", value: formatSar(summary.poValueSar) },
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

export default OpenGrPurchaseOrders;
