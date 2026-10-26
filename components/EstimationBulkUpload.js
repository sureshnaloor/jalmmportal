import React, { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { FiCheck, FiDownload, FiUpload } from "react-icons/fi";
import {
  BULK_BATCH_SIZE,
  BULK_PO_SLOTS,
  bulkResultToSheetRow,
  bulkSheetColumns,
  matrixToBulkItems,
} from "../lib/estimationBulkSheet";

const TEMPLATE_CSV = "description\nGI pipe 4 inch schedule 40\nCement OPC 50 kg bag\n";

function displayCell(column, row) {
  const value = column.value(row);
  if (value === "" || value == null) return "—";
  if (column.key === "score") return `${value}%`;
  if (column.key === "stockQty") {
    const number = Number(value);
    return Number.isFinite(number)
      ? number.toLocaleString("en-US", { maximumFractionDigits: 3 })
      : value;
  }
  if (column.key === "stockPrice") {
    const number = Number(value);
    return Number.isFinite(number)
      ? number.toLocaleString("en-US", { style: "currency", currency: "SAR" })
      : value;
  }
  return value;
}

function resolveXlsx(mod) {
  if (mod && typeof mod.read === "function" && mod.utils) return mod;
  if (mod?.default && typeof mod.default.read === "function") return mod.default;
  return mod;
}

function binaryToArrayBuffer(binary) {
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) view[i] = binary.charCodeAt(i) & 0xff;
  return buffer;
}

function arrayBufferToBinary(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return binary;
}

async function readMatrix(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    const text = await file.text();
    const parsed = Papa.parse(text.replace(/^\uFEFF/, ""), {
      header: false,
      skipEmptyLines: false,
    });
    if (parsed.errors?.length && !parsed.data?.length) {
      throw new Error(parsed.errors[0].message || "Could not read this CSV file");
    }
    return parsed.data || [];
  }
  if (extension === "xlsx" || extension === "xls") {
    const XLSX = resolveXlsx(await import("xlsx"));
    const workbook = XLSX.read(arrayBufferToBinary(await file.arrayBuffer()), { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  }
  throw new Error("Upload a CSV or Excel file (.csv, .xlsx, .xls).");
}

async function downloadWorkbook(rows, filename) {
  const XLSX = resolveXlsx(await import("xlsx"));
  const sheet = XLSX.utils.json_to_sheet(rows.map(bulkResultToSheetRow));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Estimation");
  const binary = XLSX.write(book, { bookType: "xlsx", type: "binary" });
  const blob = new Blob([binaryToArrayBuffer(binary)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "estimation-support-template.csv";
  link.click();
  window.URL.revokeObjectURL(url);
}

function EstimationBulkUpload() {
  const columns = useMemo(() => bulkSheetColumns(), []);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const processedCount = batches.reduce((sum, batch) => sum + batch.rows.length, 0);
  const currentBatch = batches.length ? batches[batches.length - 1] : null;
  const awaitingAcceptance = Boolean(currentBatch && !currentBatch.accepted);
  const remaining = Math.max(0, items.length - processedCount);
  const nextCount = Math.min(BULK_BATCH_SIZE, remaining);

  const resetFile = () => {
    setItems([]);
    setBatches([]);
    setFileName("");
    setError("");
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setBatches([]);
    try {
      const matrix = await readMatrix(file);
      const parsed = matrixToBulkItems(matrix);
      if (!parsed.length) {
        setItems([]);
        setFileName("");
        setError("No material descriptions were found. Put each description in the first column, or use a description header.");
        return;
      }
      setFileName(file.name);
      setItems(parsed);
    } catch (err) {
      setItems([]);
      setFileName("");
      setError(err.message || "Could not read this file");
    }
  };

  const processFrom = async (startIndex, sourceItems) => {
    const list = sourceItems || items;
    const chunk = list.slice(startIndex, startIndex + BULK_BATCH_SIZE);
    if (!chunk.length) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch("/api/projects/estimation-support/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: chunk }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Batch matching failed");
      setBatches((prev) => [
        ...prev,
        {
          number: prev.length + 1,
          rows: Array.isArray(data.rows) ? data.rows : [],
          accepted: false,
        },
      ]);
    } catch (err) {
      setError(err.message || "Batch matching failed");
    } finally {
      setProcessing(false);
    }
  };

  const acceptAndContinue = async () => {
    if (!currentBatch || currentBatch.accepted || processing) return;
    const startIndex = processedCount;
    const hasMore = startIndex < items.length;
    setProcessing(true);
    setBatches((prev) =>
      prev.map((batch, index) =>
        index === prev.length - 1 ? { ...batch, accepted: true } : batch
      )
    );
    if (!hasMore) {
      setProcessing(false);
      return;
    }
    await processFrom(startIndex);
  };

  const downloadCurrent = async () => {
    if (!currentBatch) return;
    setError("");
    try {
      await downloadWorkbook(currentBatch.rows, `estimation-batch-${currentBatch.number}.xlsx`);
    } catch (err) {
      setError(err.message || "Could not download this batch");
    }
  };

  const downloadAll = async () => {
    const rows = batches.flatMap((batch) => batch.rows);
    if (!rows.length) return;
    setError("");
    try {
      await downloadWorkbook(rows, "estimation-support-results.xlsx");
    } catch (err) {
      setError(err.message || "Could not download the results");
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk file</h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Upload a CSV or Excel file with any number of BOQ descriptions. The file is
            matched {BULK_BATCH_SIZE} materials at a time. Each row keeps only the closest
            material. Stock price and the {BULK_PO_SLOTS} most recent purchase orders are
            written in columns on that row. Review the batch file, then accept it to run
            the next {BULK_BATCH_SIZE}. Matches are applied automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <FiDownload className="mr-2" />
          Template
        </button>
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className="mt-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-sky-300 bg-sky-50 px-4 py-6 text-center hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiUpload className="mb-2 text-sky-700" />
        <span className="text-sm font-medium text-sky-900">
          {fileName || "Choose a CSV or Excel file"}
        </span>
        <span className="mt-1 text-xs text-sky-800">
          One description per row. A header named description is optional.
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,text/csv"
        className="sr-only"
        onChange={onFile}
        disabled={processing}
      />

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <span>
            {fileName}: {items.length} materials. Processed {processedCount}. Remaining {remaining}.
          </span>
          {fileName && (
            <button type="button" onClick={resetFile} className="text-sky-800 hover:underline" disabled={processing}>
              Remove file
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {items.length > 0 && !awaitingAcceptance && remaining > 0 && (
          <button
            type="button"
            onClick={() => processFrom(processedCount)}
            disabled={processing}
            className="inline-flex items-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing
              ? "Matching this batch…"
              : processedCount === 0
                ? `Process first ${nextCount}`
                : `Process next ${nextCount}`}
          </button>
        )}
        {awaitingAcceptance && (
          <>
            <button
              type="button"
              onClick={downloadCurrent}
              className="inline-flex items-center rounded-md border border-sky-700 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-50"
            >
              <FiDownload className="mr-2" />
              Download batch {currentBatch.number}
            </button>
            <button
              type="button"
              onClick={acceptAndContinue}
              disabled={processing}
              className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiCheck className="mr-2" />
              {processing
                ? "Matching the next batch…"
                : remaining > 0
                  ? `Accept batch and process next ${Math.min(BULK_BATCH_SIZE, remaining)}`
                  : "Accept final batch"}
            </button>
          </>
        )}
        {batches.length > 0 && (
          <button
            type="button"
            onClick={downloadAll}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiDownload className="mr-2" />
            Download all rows so far
          </button>
        )}
      </div>

      {processing && (
        <p className="mt-3 text-sm text-gray-500">
          The first batch loads the material index and can take a minute.
        </p>
      )}

      {awaitingAcceptance && (
        <p className="mt-3 text-sm text-amber-800">
          Batch {currentBatch.number} is ready
          {currentBatch.rows.length
            ? ` (file rows ${currentBatch.rows[0].sourceRow}–${
                currentBatch.rows[currentBatch.rows.length - 1].sourceRow
              })`
            : ""}
          . Review the table or the downloaded file. The next materials stay waiting until you accept this output.
        </p>
      )}

      {items.length > 0 && remaining === 0 && currentBatch?.accepted && (
        <p className="mt-3 text-sm text-emerald-800">
          All {items.length} materials have been matched and the batches are accepted.
        </p>
      )}

      {batches.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Batch</th>
                {columns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2 font-medium">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.flatMap((batch) =>
                batch.rows.map((row, rowIndex) => (
                  <tr
                    key={`${batch.number}-${row.sourceRow}-${rowIndex}`}
                    className={batch.accepted ? "bg-white" : "bg-sky-50"}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-gray-500">{batch.number}</td>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-2 text-gray-800 ${
                          column.key === "description" || column.key === "proposed"
                            ? "min-w-[14rem]"
                            : "whitespace-nowrap"
                        } ${column.key === "confidence" && row.proposed?.lowConfidence ? "font-medium text-amber-800" : ""}`}
                      >
                        {displayCell(column, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default EstimationBulkUpload;
