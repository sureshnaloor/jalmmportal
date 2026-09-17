import React from "react";

const HIDDEN_FIELDS = new Set(["_id", "id", "__v"]);

function prettyLabel(key) {
  return String(key || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatScalar(value) {
  if (value == null || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  return text;
}

function flattenObject(value, prefix = "") {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [{ label: prefix, value }] : [];
  }
  return Object.entries(value).flatMap(([key, nested]) => {
    const label = prefix ? `${prefix} / ${prettyLabel(key)}` : prettyLabel(key);
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return flattenObject(nested, label);
    }
    return [{ label, value: nested }];
  });
}

function isObjectIdString(value) {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

function firstVendor(doc) {
  const nested =
    (Array.isArray(doc.vendorDetails) && doc.vendorDetails[0]) ||
    (Array.isArray(doc.vendor) && doc.vendor[0]) ||
    (Array.isArray(doc.vendors) && doc.vendors[0]) ||
    (doc.vendorDetails && !Array.isArray(doc.vendorDetails) ? doc.vendorDetails : null) ||
    (doc.vendor && !Array.isArray(doc.vendor) ? doc.vendor : null);
  return nested && typeof nested === "object" ? nested : null;
}

function flattenDocumentsForTable(documents) {
  return (documents || []).map((doc) => {
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;
    const row = { ...doc };
    if (
      row._id != null &&
      !isObjectIdString(String(row._id)) &&
      row["po-number"] == null &&
      row.poNumber == null
    ) {
      row["po-number"] = row._id;
    }
    const vendor = firstVendor(row);
    if (vendor) {
      if (vendor["vendor-name"] && !row["vendor-name"] && !row.vendorname) {
        row["vendor-name"] = vendor["vendor-name"];
      }
      if (vendor["vendor-code"] && !row["vendor-code"] && !row.vendorcode) {
        row["vendor-code"] = vendor["vendor-code"];
      }
      delete row.vendorDetails;
      delete row.vendor;
      delete row.vendors;
    }
    return row;
  });
}

const PREFERRED_COLUMNS = [
  "po-number",
  "totalValue",
  "totalvalue",
  "vendorcode",
  "vendor-code",
  "vendorname",
  "vendor-name",
  "po-date",
  "lineItems",
];

function visibleColumns(documents) {
  const columns = [];
  documents.forEach((doc) => {
    Object.keys(doc || {}).forEach((key) => {
      if (HIDDEN_FIELDS.has(key)) return;
      if (!columns.includes(key)) columns.push(key);
    });
  });
  const preferred = PREFERRED_COLUMNS.filter((key) => columns.includes(key));
  const rest = columns.filter((key) => !preferred.includes(key));
  return [...preferred, ...rest];
}

function ArrayTable({ rows }) {
  const docs = rows.filter((item) => item && typeof item === "object");
  if (!docs.length) {
    return (
      <span className="text-sm font-medium text-slate-800">
        {rows.map((item) => formatScalar(item)).filter(Boolean).join(", ") || "—"}
      </span>
    );
  }
  const headers = visibleColumns(docs).slice(0, 8);
  return (
    <table className="min-w-[220px] border-collapse text-left text-[12px]">
      <thead>
        <tr className="bg-slate-100 text-slate-600">
          {headers.map((col) => (
            <th key={col} className="border border-slate-200 px-2 py-1 font-semibold">
              {prettyLabel(col)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {docs.slice(0, 40).map((doc, index) => (
          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
            {headers.map((col) => (
              <td key={col} className="border border-slate-200 px-2 py-1 align-top text-slate-800">
                {formatScalar(
                  typeof doc[col] === "object" ? JSON.stringify(doc[col]) : doc[col]
                ) || "—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CellValue({ value }) {
  if (value == null || value === "") {
    return <span className="text-slate-300">—</span>;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-slate-300">—</span>;
    if (value.some((item) => item && typeof item === "object")) {
      return <ArrayTable rows={value} />;
    }
    return (
      <span className="text-sm font-medium text-slate-800">
        {value.map((item) => formatScalar(item)).join(", ")}
      </span>
    );
  }
  if (typeof value === "object") {
    const entries = flattenObject(value).filter(
      (item) => item.value != null && item.value !== ""
    );
    if (!entries.length) return <span className="text-slate-300">—</span>;
    return (
      <table className="border-collapse text-left text-[12px]">
        <tbody>
          {entries.map((item) => (
            <tr key={item.label}>
              <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-600">
                {item.label}
              </th>
              <td className="border border-slate-200 px-2 py-1 text-slate-800">
                {formatScalar(
                  typeof item.value === "object"
                    ? JSON.stringify(item.value)
                    : item.value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const text = formatScalar(value);
  if (/^[A-Z0-9-]{3,12}$/.test(String(value)) || /^\d{5,}$/.test(String(value))) {
    return <span className="font-mono text-[13px] font-semibold text-slate-900">{text}</span>;
  }
  return <span className="text-sm font-medium text-slate-800">{text}</span>;
}

export function RichHtmlTable({ columns, rows, documents }) {
  const docs = Array.isArray(documents) ? flattenDocumentsForTable(documents) : null;
  const headers = docs ? visibleColumns(docs) : columns;
  const dataRows = docs
    ? docs.map((doc) => headers.map((col) => doc?.[col]))
    : rows;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-700 text-white">
              {headers.map((col) => (
                <th
                  key={col}
                  className="border-b border-slate-600 px-3 py-2 text-[11px] font-bold uppercase tracking-wider"
                >
                  {prettyLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(dataRows || []).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-t border-slate-200 px-3 py-2 align-top"
                  >
                    <CellValue value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentGallery({ documents }) {
  if (!Array.isArray(documents) || !documents.length) return null;
  return (
    <div className="mt-4">
      <div className="mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {documents.length} row{documents.length === 1 ? "" : "s"}
        </span>
      </div>
      <RichHtmlTable documents={documents} />
    </div>
  );
}

function stripMarkdownTables(text) {
  if (!text) return "";
  const lines = text.split(/\r?\n/);
  const kept = [];
  let inTable = false;
  for (const line of lines) {
    const isTableRow = /^\s*\|.+\|\s*$/.test(line);
    const isDivider = /^\s*\|?\s*:?-{3,}/.test(line);
    if (isTableRow || isDivider) {
      inTable = true;
      continue;
    }
    if (inTable && !line.trim()) {
      inTable = false;
      continue;
    }
    inTable = false;
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function parseMarkdownTable(text) {
  const lines = text.split(/\r?\n/).filter((line) => /^\s*\|/.test(line));
  if (lines.length < 2) return null;
  const cells = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  const headers = cells(lines[0]);
  const rows = lines.slice(2).map(cells).filter((row) => row.some(Boolean));
  if (!headers.length || !rows.length) return null;
  return { headers, rows };
}

function richInline(text) {
  return escapeHtml(text)
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold text-slate-900">$1</strong>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded-md bg-sky-100 px-1.5 py-0.5 text-[12px] font-semibold text-sky-800">$1</code>'
    );
}

export function RichAssistantText({ text, hideTables = false }) {
  const source = hideTables ? stripMarkdownTables(text) : text;
  if (!source) return null;

  const blocks = source.split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[15px] leading-7 text-slate-700">
      {blocks.map((block, index) => {
        const table = parseMarkdownTable(block);
        if (table && !hideTables) {
          return (
            <RichHtmlTable
              key={index}
              columns={table.headers}
              rows={table.rows}
            />
          );
        }
        const lines = block.split("\n");
        const isList = lines.every(
          (line) => !line.trim() || /^\s*[-*•]\s+/.test(line)
        );
        if (isList) {
          return (
            <ul key={index} className="space-y-1.5 pl-1">
              {lines
                .filter((line) => line.trim())
                .map((line, lineIndex) => (
                  <li
                    key={lineIndex}
                    className="border-b border-slate-100 px-1 py-1 last:border-b-0"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: richInline(line.replace(/^\s*[-*•]\s+/, "")),
                      }}
                    />
                  </li>
                ))}
            </ul>
          );
        }
        return (
          <p
            key={index}
            className="text-slate-800"
            dangerouslySetInnerHTML={{
              __html: richInline(block).replace(/\n/g, "<br />"),
            }}
          />
        );
      })}
    </div>
  );
}
