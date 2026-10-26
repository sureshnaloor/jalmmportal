export const BULK_BATCH_SIZE = 10;
export const BULK_PO_SLOTS = 5;

export function matrixToBulkItems(matrix) {
  const rows = Array.isArray(matrix) ? matrix : [];
  if (!rows.length) return [];

  const header = (Array.isArray(rows[0]) ? rows[0] : []).map((cell) => String(cell || "").trim());
  const rules = [/description/i, /boq/i, /specification/i, /^material$/i, /material name/i];
  let descriptionIndex = -1;
  for (const rule of rules) {
    const index = header.findIndex((cell) => rule.test(cell));
    if (index >= 0) {
      descriptionIndex = index;
      break;
    }
  }

  const start = descriptionIndex >= 0 ? 1 : 0;
  const column = descriptionIndex >= 0 ? descriptionIndex : 0;
  const items = [];
  for (let i = start; i < rows.length; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    const description = String(row[column] || "").trim();
    if (!description) continue;
    items.push({
      line: items.length + 1,
      sourceRow: i + 1,
      description,
    });
  }
  return items;
}

function formatSheetDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function priceWithCurrency(po) {
  if (!po || po.unitPrice == null || po.unitPrice === "") return "";
  const number = Number(po.unitPrice);
  if (!Number.isFinite(number)) return "";
  const formatted = number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return po.currency ? `${formatted} ${po.currency}` : formatted;
}

export function bulkSheetColumns() {
  const columns = [
    { key: "fileRow", label: "File row", value: (row) => row.sourceRow || row.line || "" },
    { key: "description", label: "BOQ description", value: (row) => row.description || "" },
    {
      key: "code",
      label: "Proposed material code",
      value: (row) => row.proposed?.["material-code"] || row.proposed?.code || "",
    },
    {
      key: "proposed",
      label: "Proposed material",
      value: (row) => row.proposed?.["material-description"] || row.proposed?.description || "",
    },
    {
      key: "uom",
      label: "Proposed UOM",
      value: (row) => row.proposed?.["unit-measure"] || row.proposed?.uom || "",
    },
    {
      key: "score",
      label: "Match %",
      value: (row) => (row.proposed ? row.proposed.matchPercent : ""),
    },
    {
      key: "confidence",
      label: "Confidence",
      value: (row) => {
        if (!row.proposed) return "";
        return row.proposed.lowConfidence ? "Low" : "OK";
      },
    },
    {
      key: "stockQty",
      label: "Stock quantity",
      value: (row) => row.stockSummary?.quantity ?? "",
    },
    {
      key: "stockPrice",
      label: "Stock unit price (SAR)",
      value: (row) =>
        row.stockSummary?.unitPriceSar == null ? "" : row.stockSummary.unitPriceSar,
    },
    { key: "poCount", label: "PO count", value: (row) => row.poCount ?? 0 },
  ];

  for (let slot = 0; slot < BULK_PO_SLOTS; slot += 1) {
    const number = slot + 1;
    columns.push(
      {
        key: `po${number}number`,
        label: `PO ${number} number`,
        value: (row) => row.purchaseOrders?.[slot]?.poNumber || "",
      },
      {
        key: `po${number}date`,
        label: `PO ${number} date`,
        value: (row) => formatSheetDate(row.purchaseOrders?.[slot]?.poDate),
      },
      {
        key: `po${number}vendorCode`,
        label: `PO ${number} vendor code`,
        value: (row) => row.purchaseOrders?.[slot]?.vendorCode || "",
      },
      {
        key: `po${number}vendorName`,
        label: `PO ${number} vendor name`,
        value: (row) => row.purchaseOrders?.[slot]?.vendorName || "",
      },
      {
        key: `po${number}price`,
        label: `PO ${number} unit price`,
        value: (row) => priceWithCurrency(row.purchaseOrders?.[slot]),
      }
    );
  }

  columns.push({ key: "note", label: "Note", value: (row) => row.note || "" });
  return columns;
}

export function bulkResultToSheetRow(row) {
  const record = {};
  bulkSheetColumns().forEach((column) => {
    record[column.label] = column.value(row);
  });
  return record;
}
