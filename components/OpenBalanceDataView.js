import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiSearch,
  FiX,
} from "react-icons/fi";

function matchesQuery(value, query) {
  if (query == null || String(query).trim() === "") return true;
  const text = String(value ?? "").toLowerCase();
  const raw = String(query).trim().toLowerCase();
  if (raw.includes("*")) {
    const parts = raw.split("*").map((p) => p.trim()).filter(Boolean);
    return parts.every((part) => text.includes(part));
  }
  return text.includes(raw);
}

function compareValues(a, b, type) {
  const emptyA = a == null || a === "";
  const emptyB = b == null || b === "";
  if (emptyA && emptyB) return 0;
  if (emptyA) return 1;
  if (emptyB) return -1;

  if (type === "number" || type === "currency") {
    return Number(a) - Number(b);
  }
  if (type === "date") {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    const na = Number.isNaN(da) ? 0 : da;
    const nb = Number.isNaN(db) ? 0 : db;
    return na - nb;
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function formatCell(value, column) {
  if (value == null || value === "") return "—";
  if (column.type === "date") {
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("MM/DD/YYYY") : String(value);
  }
  if (column.type === "currency") {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (column.type === "number") {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString("en-US", { maximumFractionDigits: 10 });
  }
  return String(value);
}

function uniqueOptions(rows, key) {
  const set = new Set();
  rows.forEach((row) => {
    const value = row[key];
    if (value != null && String(value).trim() !== "") {
      set.add(String(value));
    }
  });
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}

function groupRowsByKey(sortedRows, groupByKey) {
  if (!groupByKey) return null;
  const map = new Map();
  const order = [];
  for (const row of sortedRows) {
    const key = String(row[groupByKey] ?? "");
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key).push(row);
  }
  return order.map((key) => ({ key, rows: map.get(key) }));
}

function paginateGroups(groups, pageSize) {
  const pages = [];
  let bucket = [];
  let lines = 0;
  for (const group of groups) {
    const groupLines = group.rows.length;
    if (bucket.length > 0 && lines + groupLines > pageSize) {
      pages.push(bucket);
      bucket = [group];
      lines = groupLines;
    } else {
      bucket.push(group);
      lines += groupLines;
    }
  }
  if (bucket.length) pages.push(bucket);
  return pages;
}

export default function OpenBalanceDataView({
  title,
  subtitle,
  columns,
  rows,
  loading,
  error,
  summaryItems = [],
  defaultSort = [],
  defaultView = "table",
  getRowKey,
  onRowLink,
  emptyMessage = "No records match the current filters.",
  cardAccent = "blue",
  groupByKey = null,
  renderGroupSidebar = null,
}) {
  const searchableColumns = useMemo(
    () => columns.filter((col) => col.searchable),
    [columns]
  );
  const selectColumns = useMemo(
    () => columns.filter((col) => col.filterType === "select"),
    [columns]
  );

  const [viewMode, setViewMode] = useState(defaultView);
  const [filters, setFilters] = useState({});
  const [sortLevels, setSortLevels] = useState(defaultSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [filters, sortLevels, pageSize, rows]);

  const selectOptions = useMemo(() => {
    const map = {};
    selectColumns.forEach((col) => {
      map[col.key] = col.options || uniqueOptions(rows, col.key);
    });
    return map;
  }, [rows, selectColumns]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((col) => {
        const query = filters[col.key];
        if (query == null || String(query).trim() === "") return true;
        return matchesQuery(row[col.key], query);
      })
    );
  }, [rows, columns, filters]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    if (!sortLevels.length) return list;
    const colType = Object.fromEntries(columns.map((c) => [c.key, c.type || "string"]));
    list.sort((a, b) => {
      for (const level of sortLevels) {
        const dir = level.direction === "desc" ? -1 : 1;
        const cmp = compareValues(a[level.key], b[level.key], colType[level.key]);
        if (cmp !== 0) return cmp * dir;
      }
      return 0;
    });
    return list;
  }, [filteredRows, sortLevels, columns]);

  const groupedRows = useMemo(
    () => groupRowsByKey(sortedRows, groupByKey),
    [sortedRows, groupByKey]
  );

  const groupedPages = useMemo(
    () => (groupedRows ? paginateGroups(groupedRows, pageSize) : null),
    [groupedRows, pageSize]
  );

  const totalPages = groupedPages
    ? Math.max(1, groupedPages.length)
    : Math.max(1, Math.ceil(sortedRows.length / pageSize) || 1);
  const currentPage = Math.min(page, totalPages);
  const pageGroups = groupedPages ? groupedPages[currentPage - 1] || [] : null;
  const pageRows = pageGroups
    ? pageGroups.flatMap((group) => group.rows)
    : sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pageLineStart = useMemo(() => {
    if (sortedRows.length === 0) return 0;
    if (!groupedPages) return (currentPage - 1) * pageSize + 1;
    let count = 0;
    for (let i = 0; i < currentPage - 1; i += 1) {
      count += groupedPages[i].reduce((n, group) => n + group.rows.length, 0);
    }
    return count + 1;
  }, [sortedRows.length, groupedPages, currentPage, pageSize]);
  const pageLineEnd = sortedRows.length === 0 ? 0 : pageLineStart + pageRows.length - 1;

  const activeFilterCount = Object.values(filters).filter(
    (v) => v != null && String(v).trim() !== ""
  ).length;

  const columnByKey = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.key, c])),
    [columns]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({});

  const handleHeaderSort = (key, event) => {
    const addLevel = event.shiftKey;
    setSortLevels((prev) => {
      const existingIndex = prev.findIndex((level) => level.key === key);
      if (addLevel) {
        if (existingIndex >= 0) {
          return prev.map((level, i) =>
            i === existingIndex
              ? { ...level, direction: level.direction === "asc" ? "desc" : "asc" }
              : level
          );
        }
        return [...prev, { key, direction: "asc" }];
      }
      if (existingIndex >= 0 && prev.length === 1) {
        return [
          { key, direction: prev[0].direction === "asc" ? "desc" : "asc" },
        ];
      }
      if (existingIndex === 0) {
        return prev.map((level, i) =>
          i === 0
            ? { ...level, direction: level.direction === "asc" ? "desc" : "asc" }
            : level
        );
      }
      return [{ key, direction: "asc" }, ...prev.filter((level) => level.key !== key)];
    });
  };

  const toggleSortDirection = (index) => {
    setSortLevels((prev) =>
      prev.map((level, i) =>
        i === index
          ? { ...level, direction: level.direction === "asc" ? "desc" : "asc" }
          : level
      )
    );
  };

  const removeSortLevel = (index) => {
    setSortLevels((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSortLevel = (index, delta) => {
    setSortLevels((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const resetSort = () => setSortLevels(defaultSort);

  const sortRank = (key) => sortLevels.findIndex((level) => level.key === key);

  const accent = {
    blue: {
      header: "from-blue-50 to-indigo-50",
      badge: "bg-blue-100 text-blue-800",
      border: "border-blue-200",
      button: "bg-blue-600 text-white",
    },
    emerald: {
      header: "from-emerald-50 to-teal-50",
      badge: "bg-emerald-100 text-emerald-800",
      border: "border-emerald-200",
      button: "bg-emerald-600 text-white",
    },
  }[cardAccent] || {
    header: "from-blue-50 to-indigo-50",
    badge: "bg-blue-100 text-blue-800",
    border: "border-blue-200",
    button: "bg-blue-600 text-white",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
          {subtitle ? <p className="text-gray-600">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Layout</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                viewMode === "table"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Table / list view"
            >
              <FiList className="w-4 h-4" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                viewMode === "card"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Card view"
            >
              <FiGrid className="w-4 h-4" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {summaryItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className={`bg-white rounded-lg shadow-lg border ${accent.border}`}>
        <div className={`px-4 py-3 border-b bg-gradient-to-r ${accent.header} flex items-center justify-between`}>
          <h2 className="font-semibold text-gray-800">Search</h2>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-red-700 hover:underline"
              >
                Clear {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="text-xs text-blue-700 hover:underline"
            >
              {showFilters ? "Hide fields" : "Show fields"}
            </button>
          </div>
        </div>
        {showFilters ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {searchableColumns.map((col) => (
              <label key={col.key} className="block">
                <span className="block text-xs font-medium text-gray-600 mb-1">
                  {col.label}
                </span>
                {col.filterType === "select" ? (
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={filters[col.key] || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  >
                    <option value="">All</option>
                    {(selectOptions[col.key] || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={filters[col.key] || ""}
                      onChange={(e) => handleFilterChange(col.key, e.target.value)}
                      placeholder={col.searchPlaceholder || `Search ${col.label.toLowerCase()}`}
                      className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                )}
              </label>
            ))}
          </div>
        ) : null}
        <p className="px-4 pb-3 text-xs text-gray-500">
          Separate search fields apply together (AND). Use * between terms. Click a column to sort;
          Shift+click adds another sort level (kept together, e.g. PO number then line item).
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Sort levels</span>
            {sortLevels.length === 0 ? (
              <span className="text-sm text-gray-400">None</span>
            ) : (
              sortLevels.map((level, index) => {
                const col = columnByKey[level.key];
                return (
                  <span
                    key={`${level.key}-${index}`}
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs"
                  >
                    <span className="font-semibold text-blue-700">{index + 1}.</span>
                    <button
                      type="button"
                      onClick={() => toggleSortDirection(index)}
                      className="inline-flex items-center gap-1 hover:text-blue-700"
                    >
                      {col?.label || level.key}
                      {level.direction === "asc" ? (
                        <FiArrowUp className="w-3 h-3" />
                      ) : (
                        <FiArrowDown className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSortLevel(index, -1)}
                      className="text-gray-400 hover:text-gray-700"
                      title="Move sort level up"
                      disabled={index === 0}
                    >
                      <FiChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSortLevel(index, 1)}
                      className="text-gray-400 hover:text-gray-700"
                      title="Move sort level down"
                      disabled={index === sortLevels.length - 1}
                    >
                      <FiChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSortLevel(index)}
                      className="text-gray-400 hover:text-red-600"
                      title="Remove sort level"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                );
              })
            )}
            <button
              type="button"
              onClick={resetSort}
              className="text-xs text-blue-700 hover:underline"
            >
              Reset default sort
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Showing {pageLineStart}–{pageLineEnd} of {sortedRows.length}
            {rows.length !== sortedRows.length ? ` (filtered from ${rows.length})` : ""}
            {pageGroups ? ` · ${pageGroups.length} PO${pageGroups.length === 1 ? "" : "s"} on this page` : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-700">{error}</div>
        ) : sortedRows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto bg-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  {groupByKey && renderGroupSidebar ? (
                    <th className="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left sticky left-0 bg-gray-100 z-20 whitespace-nowrap">
                      Close PO
                    </th>
                  ) : null}
                  {columns.map((col) => {
                    const rank = sortRank(col.key);
                    const level = rank >= 0 ? sortLevels[rank] : null;
                    return (
                      <th
                        key={col.key}
                        onClick={(e) => handleHeaderSort(col.key, e)}
                        className={`px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 whitespace-nowrap ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                        title="Click to sort. Shift+click to add a sort level."
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {level ? (
                            <>
                              {level.direction === "asc" ? (
                                <FiArrowUp className="w-3 h-3" />
                              ) : (
                                <FiArrowDown className="w-3 h-3" />
                              )}
                              <span className="text-[10px] bg-blue-100 text-blue-700 rounded-full px-1">
                                {rank + 1}
                              </span>
                            </>
                          ) : null}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              {pageGroups && renderGroupSidebar
                ? pageGroups.map((group, groupIndex) => (
                    <tbody key={group.key || groupIndex} className="bg-white">
                      {groupIndex > 0 ? (
                        <tr className="bg-gray-100">
                          <td
                            colSpan={columns.length + 1}
                            className="h-3 p-0 border-0"
                          />
                        </tr>
                      ) : null}
                      {group.rows.map((row, index) => (
                        <tr
                          key={getRowKey ? getRowKey(row, index) : `${group.key}-${index}`}
                          className={`hover:bg-blue-50 ${index === 0 ? "border-t border-gray-200" : ""}`}
                        >
                          {index === 0 ? (
                            <td
                              rowSpan={group.rows.length}
                              className="align-top sticky left-0 z-[5] bg-slate-50 border-l-4 border-sky-600 px-2 py-2 w-56 min-w-[13.5rem] max-w-[13.5rem] shadow-[2px_0_8px_-4px_rgba(0,0,0,0.15)]"
                            >
                              {renderGroupSidebar(group)}
                            </td>
                          ) : null}
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className={`px-3 py-2 ${
                                col.align === "right" ? "text-right tabular-nums" : ""
                              } ${col.nowrap === false ? "" : "whitespace-nowrap"} ${
                                col.muted ? "text-gray-500" : "text-gray-800"
                              } ${index === group.rows.length - 1 ? "border-b border-gray-200" : ""}`}
                              title={row[col.key] == null ? "" : String(row[col.key])}
                            >
                              {renderLinkedCell(row, col, onRowLink)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  ))
                : (
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {pageRows.map((row, index) => (
                        <tr
                          key={getRowKey ? getRowKey(row, index) : index}
                          className="hover:bg-blue-50"
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className={`px-3 py-2 ${
                                col.align === "right" ? "text-right tabular-nums" : ""
                              } ${col.nowrap === false ? "" : "whitespace-nowrap"} ${
                                col.muted ? "text-gray-500" : "text-gray-800"
                              }`}
                              title={row[col.key] == null ? "" : String(row[col.key])}
                            >
                              {renderLinkedCell(row, col, onRowLink)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  )}
            </table>
          </div>
        ) : pageGroups && renderGroupSidebar ? (
          <div className="p-4 space-y-4 bg-gray-100">
            {pageGroups.map((group) => (
              <div
                key={group.key}
                className="flex bg-white rounded-md shadow-sm overflow-hidden"
              >
                <aside className="w-56 shrink-0 p-3 bg-slate-50 border-l-4 border-sky-600">
                  {renderGroupSidebar(group)}
                </aside>
                <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {group.rows.map((row, index) => (
                    <article
                      key={getRowKey ? getRowKey(row, index) : `${group.key}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all bg-white"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-sky-700 text-sm">
                          {renderCardTitle(row, columns, onRowLink)}
                        </h3>
                        {row["item-type"] || row["stock-type"] ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${accent.badge}`}>
                            {row["item-type"] || row["stock-type"]}
                          </span>
                        ) : null}
                      </div>
                      <dl className="space-y-1.5 text-xs text-gray-600">
                        {columns
                          .filter((col) => col.card !== false)
                          .slice(0, 10)
                          .map((col) => (
                            <div key={col.key} className="flex justify-between gap-3">
                              <dt className="font-medium text-gray-500">{col.label}</dt>
                              <dd className="text-right text-gray-800 break-all">
                                {renderLinkedCell(row, col, onRowLink)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageRows.map((row, index) => (
              <article
                key={getRowKey ? getRowKey(row, index) : index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-sky-700 text-sm">
                    {renderCardTitle(row, columns, onRowLink)}
                  </h3>
                  {row["item-type"] || row["stock-type"] ? (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${accent.badge}`}>
                      {row["item-type"] || row["stock-type"]}
                    </span>
                  ) : null}
                </div>
                <dl className="space-y-1.5 text-xs text-gray-600">
                  {columns
                    .filter((col) => col.card !== false)
                    .slice(0, 10)
                    .map((col) => (
                      <div key={col.key} className="flex justify-between gap-3">
                        <dt className="font-medium text-gray-500">{col.label}</dt>
                        <dd className="text-right text-gray-800 break-all">
                          {renderLinkedCell(row, col, onRowLink)}
                        </dd>
                      </div>
                    ))}
                </dl>
              </article>
            ))}
          </div>
        )}

        <div className="px-4 py-3 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="text-sm text-gray-600 flex items-center gap-2">
            Rows per page{groupByKey ? " (POs kept together)" : ""}
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLinkedCell(row, col, onRowLink) {
  const formatted = formatCell(row[col.key], col);
  if (col.linkTo && onRowLink) {
    const href = onRowLink(row, col);
    if (href) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 hover:underline font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          {formatted}
        </a>
      );
    }
  }
  return formatted;
}

function renderCardTitle(row, columns, onRowLink) {
  const titleCol = columns.find((col) => col.cardTitle) || columns[0];
  if (!titleCol) return "";
  return renderLinkedCell(row, titleCol, onRowLink);
}
