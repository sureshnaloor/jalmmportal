import React, { useState } from "react";
import { getSession } from "next-auth/react";
import moment from "moment";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";
import { FiSearch, FiCheck, FiX, FiPackage, FiShoppingCart } from "react-icons/fi";
import EstimationBulkUpload from "../../components/EstimationBulkUpload";

function formatNumber(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatSar(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString("en-US", { style: "currency", currency: "SAR" });
}

function formatPrice(value, currency) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  if (currency === "SAR") return formatSar(number);
  const formatted = formatNumber(number, 4);
  return currency ? `${formatted} ${currency}` : formatted;
}

function MatchCard({ match, onAccept, accepting, emphasized }) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        emphasized
          ? "border-sky-300 bg-gradient-to-r from-sky-50 to-white shadow-md"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            {emphasized ? "Highest match" : `Alternative ${match.rank}`}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">
            {match["material-description"] || "No description"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Code {match["material-code"]}
            {match["unit-measure"] ? ` · ${match["unit-measure"]}` : ""}
            {match["material-group"] ? ` · Group ${match["material-group"]}` : ""}
            {match["material-type"] ? ` · ${match["material-type"]}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-sky-800">{match.matchPercent}%</p>
          <p className="text-xs text-gray-500">match score {match.score}</p>
        </div>
      </div>
      {match.lowConfidence && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This score is low. Check the description before accepting it.
        </p>
      )}
      <button
        type="button"
        onClick={() => onAccept(match)}
        disabled={accepting}
        className="mt-4 inline-flex items-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiCheck className="mr-2" />
        Accept this material
      </button>
    </div>
  );
}

function EstimationSupport() {
  const [description, setDescription] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [best, setBest] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [accepted, setAccepted] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [prices, setPrices] = useState(null);

  const resetResults = () => {
    setBest(null);
    setAlternatives([]);
    setShowAlternatives(false);
    setAccepted(null);
    setPrices(null);
    setError("");
  };

  const search = async (event) => {
    event.preventDefault();
    const text = description.trim();
    if (text.length < 3) {
      setError("Enter a material description of at least a few characters.");
      return;
    }
    setSearching(true);
    resetResults();
    try {
      const response = await fetch("/api/projects/estimation-support/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed");
      setQuery(text);
      setBest(data.best || null);
      setAlternatives(Array.isArray(data.alternatives) ? data.alternatives : []);
      if (!data.best) {
        setError("No material in the embedding index was close to this description.");
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const acceptMatch = async (match) => {
    setAccepted(match);
    setPrices(null);
    setError("");
    setLoadingPrices(true);
    try {
      const response = await fetch(
        `/api/projects/estimation-support/prices?materialCode=${encodeURIComponent(
          match["material-code"]
        )}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load prices");
      setPrices(data);
    } catch (err) {
      setError(err.message || "Failed to load prices");
    } finally {
      setLoadingPrices(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderComponent />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Estimation Support</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Match one BOQ description, or upload a file and work through it in batches of 10.
            Bulk rows use the closest material automatically and place purchase-order
            details in columns on that row.
          </p>
        </div>

        <EstimationBulkUpload />

        <h2 className="mb-3 text-lg font-semibold text-gray-900">Single material</h2>
        <form
          onSubmit={search}
          className="mb-6 rounded-lg bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          <label htmlFor="boq-description" className="mb-2 block text-sm font-medium text-gray-700">
            BOQ material description
          </label>
          <textarea
            id="boq-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Example: GI pipe 4 inch schedule 40"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-sky-500 focus:outline-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSearch className="mr-2" />
              {searching ? "Searching…" : "Find closest material"}
            </button>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setDescription("");
                  setQuery("");
                  resetResults();
                }}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiX className="mr-1" />
                Clear
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {best && (
          <section className="mb-6 space-y-4">
            <MatchCard
              match={best}
              emphasized
              accepting={loadingPrices}
              onAccept={acceptMatch}
            />
            {alternatives.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowAlternatives((open) => !open)}
                  className="text-sm font-medium text-sky-800 hover:underline"
                >
                  {showAlternatives
                    ? "Hide other close matches"
                    : `This is not the right material (${alternatives.length} other matches)`}
                </button>
                {showAlternatives && (
                  <div className="mt-3 space-y-3">
                    {alternatives.map((match) => (
                      <MatchCard
                        key={match["material-code"]}
                        match={match}
                        accepting={loadingPrices}
                        onAccept={acceptMatch}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {accepted && (
          <section className="space-y-6">
            <div className="rounded-lg bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Accepted material
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                {accepted["material-description"]}
              </h2>
              <p className="text-sm text-gray-600">
                {accepted["material-code"]}
                {prices?.material?.uom ? ` · ${prices.material.uom}` : ""}
                {` · matched to “${query}” at ${accepted.matchPercent}%`}
              </p>
            </div>

            {loadingPrices && (
              <div className="flex justify-center py-8">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-sky-600" />
              </div>
            )}

            {prices && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase text-gray-500">Stock on hand</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {formatNumber(prices.stockSummary.quantity, 3)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatSar(prices.stockSummary.valueSar)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase text-gray-500">Stock unit price</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {prices.stockSummary.unitPriceSar == null
                        ? "No stock"
                        : formatSar(prices.stockSummary.unitPriceSar)}
                    </p>
                    <p className="text-sm text-gray-600">Value divided by quantity</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase text-gray-500">Purchase orders</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{prices.poCount}</p>
                    <p className="text-sm text-gray-600">
                      {prices.purchaseOrders[0]
                        ? `Latest ${formatPrice(
                            prices.purchaseOrders[0].unitPrice,
                            prices.purchaseOrders[0].currency
                          )}`
                        : "No purchase history"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <div className="flex items-center gap-2 border-b bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
                    <FiPackage className="text-emerald-700" />
                    <h3 className="text-lg font-semibold text-gray-800">Stock prices</h3>
                  </div>
                  {prices.stock.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-gray-500">
                      This material has no quantity or value in complete stock or special stock.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Plant</th>
                            <th className="px-4 py-3">WBS</th>
                            <th className="px-4 py-3 text-right">Quantity</th>
                            <th className="px-4 py-3">UoM</th>
                            <th className="px-4 py-3 text-right">Value</th>
                            <th className="px-4 py-3 text-right">Unit price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {prices.stock.map((row, index) => (
                            <tr key={`${row.stockType}-${row.plant}-${row.wbs}-${index}`}>
                              <td className="px-4 py-3">{row.stockType}</td>
                              <td className="px-4 py-3">{row.plant || "—"}</td>
                              <td className="px-4 py-3">{row.wbs || "—"}</td>
                              <td className="px-4 py-3 text-right">{formatNumber(row.quantity, 3)}</td>
                              <td className="px-4 py-3">{row.uom || "—"}</td>
                              <td className="px-4 py-3 text-right">{formatSar(row.valueSar)}</td>
                              <td className="px-4 py-3 text-right font-medium">
                                {row.unitPriceSar == null ? "—" : formatSar(row.unitPriceSar)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <div className="flex items-center gap-2 border-b bg-gradient-to-r from-sky-50 to-white px-5 py-4">
                    <FiShoppingCart className="text-sky-700" />
                    <h3 className="text-lg font-semibold text-gray-800">Purchase order prices</h3>
                  </div>
                  {prices.purchaseOrders.length === 0 ? (
                    <p className="px-5 py-6 text-sm text-gray-500">
                      No purchase orders were found for this material code.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                          <tr>
                            <th className="px-4 py-3">PO number</th>
                            <th className="px-4 py-3">PO date</th>
                            <th className="px-4 py-3">Vendor code</th>
                            <th className="px-4 py-3">Vendor name</th>
                            <th className="px-4 py-3 text-right">Unit price</th>
                            <th className="px-4 py-3 text-right">Quantity</th>
                            <th className="px-4 py-3">UoM</th>
                            <th className="px-4 py-3 text-right">Value (SAR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {prices.purchaseOrders.map((row, index) => (
                            <tr key={`${row.poNumber}-${row.poLine}-${index}`}>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {row.poNumber}
                                {row.poLine ? (
                                  <span className="block text-xs font-normal text-gray-500">
                                    Line {row.poLine}
                                  </span>
                                ) : null}
                              </td>
                              <td className="px-4 py-3">
                                {row.poDate ? moment(row.poDate).format("DD-MMM-YYYY") : "—"}
                              </td>
                              <td className="px-4 py-3">{row.vendorCode || "—"}</td>
                              <td className="px-4 py-3">{row.vendorName || "—"}</td>
                              <td className="px-4 py-3 text-right font-medium">
                                {formatPrice(row.unitPrice, row.currency)}
                              </td>
                              <td className="px-4 py-3 text-right">{formatNumber(row.quantity, 3)}</td>
                              <td className="px-4 py-3">{row.uom || "—"}</td>
                              <td className="px-4 py-3 text-right">{formatSar(row.valueSar)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
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

export default EstimationSupport;
