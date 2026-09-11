import React from "react";

const CARD_TONES = [
  {
    wrap: "from-sky-500 to-cyan-500",
    body: "bg-sky-50 border-sky-100",
    chip: "bg-sky-100 text-sky-800",
  },
  {
    wrap: "from-violet-500 to-fuchsia-500",
    body: "bg-violet-50 border-violet-100",
    chip: "bg-violet-100 text-violet-800",
  },
  {
    wrap: "from-emerald-500 to-teal-500",
    body: "bg-emerald-50 border-emerald-100",
    chip: "bg-emerald-100 text-emerald-800",
  },
  {
    wrap: "from-amber-500 to-orange-500",
    body: "bg-amber-50 border-amber-100",
    chip: "bg-amber-100 text-amber-800",
  },
  {
    wrap: "from-rose-500 to-pink-500",
    body: "bg-rose-50 border-rose-100",
    chip: "bg-rose-100 text-rose-800",
  },
  {
    wrap: "from-indigo-500 to-blue-500",
    body: "bg-indigo-50 border-indigo-100",
    chip: "bg-indigo-100 text-indigo-800",
  },
];

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

function pickTitle(doc) {
  return (
    doc["vendor-name"] ||
    doc.vendorname ||
    doc["material-description"] ||
    doc["po-number"] ||
    doc["project-name"] ||
    doc.name ||
    doc.title ||
    null
  );
}

function pickCode(doc) {
  return (
    doc["vendor-code"] ||
    doc.vendorcode ||
    doc["po-number"] ||
    doc["material-code"] ||
    doc.matcode ||
    null
  );
}

function initials(text) {
  const parts = String(text || "")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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
                    className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-sky-100"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
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
            className="rounded-xl bg-gradient-to-r from-sky-50 to-white px-4 py-3 text-slate-800 ring-1 ring-sky-100"
            dangerouslySetInnerHTML={{
              __html: richInline(block).replace(/\n/g, "<br />"),
            }}
          />
        );
      })}
    </div>
  );
}

function NestedChips({ value, tone }) {
  const entries = flattenObject(value).filter(
    (item) => item.value != null && item.value !== ""
  );
  if (!entries.length) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex flex-col gap-1">
      {entries.map((item) => (
        <div key={item.label} className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.chip}`}>
            {item.label}
          </span>
          <span className="text-sm font-medium text-slate-800">
            {formatScalar(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CellValue({ value, tone }) {
  if (value == null || value === "") {
    return <span className="text-slate-300">—</span>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 6).map((item, index) => (
          <span
            key={index}
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.chip}`}
          >
            {typeof item === "object" ? JSON.stringify(item) : formatScalar(item)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return <NestedChips value={value} tone={tone} />;
  }
  const text = formatScalar(value);
  if (/^[A-Z0-9-]{3,12}$/.test(String(value)) || /^\d{5,}$/.test(String(value))) {
    return (
      <span className="inline-flex rounded-lg bg-slate-900 px-2 py-0.5 font-mono text-[12px] font-semibold text-amber-200">
        {text}
      </span>
    );
  }
  return <span className="font-medium text-slate-800">{text}</span>;
}

function visibleColumns(documents) {
  const columns = [];
  documents.slice(0, 12).forEach((doc) => {
    Object.keys(doc || {}).forEach((key) => {
      if (HIDDEN_FIELDS.has(key)) return;
      if (!columns.includes(key)) columns.push(key);
    });
  });
  return columns.slice(0, 8);
}

export function RichHtmlTable({ columns, rows, documents }) {
  const docs = Array.isArray(documents) ? documents : null;
  const headers = docs ? visibleColumns(docs) : columns;
  const dataRows = docs
    ? docs.slice(0, 25).map((doc) => headers.map((col) => doc?.[col]))
    : rows;

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-500 text-white">
              {headers.map((col) => (
                <th
                  key={col}
                  className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider"
                >
                  {prettyLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => {
              const tone = CARD_TONES[rowIndex % CARD_TONES.length];
              return (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-sky-50/70"}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="max-w-[240px] border-t border-sky-100 px-3 py-3 align-top"
                    >
                      <CellValue value={cell} tone={tone} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultCard({ doc, index }) {
  const tone = CARD_TONES[index % CARD_TONES.length];
  const title = pickTitle(doc) || `Record ${index + 1}`;
  const code = pickCode(doc);
  const skip = new Set([
    ...HIDDEN_FIELDS,
    "vendor-name",
    "vendorname",
    "vendor-code",
    "vendorcode",
    "material-description",
    "po-number",
    "project-name",
    "name",
    "title",
  ]);
  const details = Object.entries(doc).filter(([key, value]) => {
    if (skip.has(key)) return false;
    if (value == null || value === "") return false;
    return true;
  });

  return (
    <article className={`overflow-hidden rounded-2xl bg-gradient-to-br ${tone.wrap} p-[2px] shadow-md`}>
      <div className={`h-full rounded-[14px] ${tone.body} p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-700 shadow-sm">
            {initials(title)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold leading-snug text-slate-900">
              {title}
            </h3>
            {code && (
              <div className="mt-1 inline-flex rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-200">
                {code}
              </div>
            )}
          </div>
        </div>
        <dl className="mt-3 space-y-2">
          {details.slice(0, 8).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-white/80 px-3 py-2 ring-1 ring-white">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {prettyLabel(key)}
              </dt>
              <dd className="mt-1">
                <CellValue value={value} tone={tone} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export function DocumentGallery({ documents }) {
  if (!Array.isArray(documents) || !documents.length) return null;
  const useCards =
    documents.length <= 12 &&
    documents.some((doc) => pickTitle(doc) || pickCode(doc));

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-gradient-to-r from-sky-600 to-teal-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {documents.length} result{documents.length === 1 ? "" : "s"}
        </span>
      </div>
      {useCards ? (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.slice(0, 12).map((doc, index) => (
            <ResultCard key={index} doc={doc} index={index} />
          ))}
        </div>
      ) : (
        <RichHtmlTable documents={documents} />
      )}
    </div>
  );
}
