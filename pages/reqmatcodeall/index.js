import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";
import {
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiPackage,
  FiRefreshCw,
  FiClipboard,
  FiSend,
  FiArrowLeft,
} from "react-icons/fi";

const STEPS = [
  { id: 1, label: "Specification" },
  { id: 2, label: "Similar materials" },
  { id: 3, label: "SAP description" },
];

const MAT_TYPES = [
  { value: "ZCVL", label: "ZCVL - Civil Materials" },
  { value: "ZMEC", label: "ZMEC - Mechanical/Piping Materials" },
  { value: "ZOFC", label: "ZOFC - Office/Camp consumables" },
  { value: "ZELC", label: "ZELC - Electrical Materials" },
  { value: "ZINS", label: "ZINS - Instrumentation Materials" },
];

const COMMON_UOMS = ["EA", "M", "KG", "PAC", "LOT", "BOX", "SET", "L", "M2", "ROL", "FT"];

function uniqueValues(items) {
  return items.filter((value, index, all) => all.indexOf(value) === index);
}

export default function ReqMatCodeAllPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [specification, setSpecification] = useState("");
  const [uom, setUom] = useState("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [searchMode, setSearchMode] = useState("");
  const [indexSize, setIndexSize] = useState(0);
  const [embeddingStatus, setEmbeddingStatus] = useState(null);
  const [indexing, setIndexing] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [newdescription, setNewdescription] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [mattypes, setMattypes] = useState([]);
  const [mattypeselected, setMattypeselected] = useState("ZOFC");
  const [matgroupselected, setMatgroupselected] = useState("");
  const [secondarymatgroupselected, setSecondarymatgroupselected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previousRequests, setPreviousRequests] = useState([]);
  const [prefillSource, setPrefillSource] = useState(null);
  const classificationPrefill = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch("/api/mattypes");
        const json = await result.json();
        setMattypes(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error("Failed to load material types", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch("/api/reqmatcodeall/embeddings");
        if (!result.ok) return;
        const json = await result.json();
        setEmbeddingStatus(json);
      } catch (error) {
        console.error("Failed to load embedding status", error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch("/api/reqmatcodeall");
        if (!result.ok) return;
        const json = await result.json();
        setPreviousRequests(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error("Failed to load previous requests", error);
      }
    })();
  }, []);

  const primaryGroups = useMemo(() => {
    const groups = uniqueValues(
      mattypes
        .filter((mt) => mt.materialtype === mattypeselected)
        .map((item) => item.matgroupprimarydesc)
        .filter(Boolean)
        .sort((a, b) => (a > b ? 1 : -1))
    );
    const prefilled = prefillSource?.matgroupprimarydesc;
    if (prefilled && !groups.includes(prefilled)) {
      return [prefilled, ...groups];
    }
    return groups;
  }, [mattypes, mattypeselected, prefillSource]);

  const secondaryGroups = useMemo(() => {
    const groups = uniqueValues(
      mattypes
        .filter((mt) => mt.matgroupprimarydesc === matgroupselected)
        .map((item) => item.matgroupsecondarydesc)
        .filter(Boolean)
    );
    const prefilled = prefillSource?.matgroupsecondarydesc;
    if (prefilled && !groups.includes(prefilled)) {
      return [prefilled, ...groups];
    }
    return groups;
  }, [mattypes, matgroupselected, prefillSource]);

  const typeOptions = useMemo(() => {
    const extraTypes = uniqueValues(
      matches
        .map((item) => String(item["material-type"] || "").trim().toUpperCase())
        .filter((type) => type && !MAT_TYPES.some((opt) => opt.value === type))
    );
    return [
      ...MAT_TYPES,
      ...extraTypes.map((type) => ({ value: type, label: type })),
    ];
  }, [matches]);

  const uomOptions = useMemo(() => {
    const fromMatches = matches
      .map((item) => String(item["unit-measure"] || "").trim().toUpperCase())
      .filter(Boolean);
    return uniqueValues(
      [...fromMatches, uom.trim().toUpperCase(), ...COMMON_UOMS].filter(Boolean)
    );
  }, [matches, uom]);

  const applyMatchClassification = (match) => {
    if (!match) return;

    const type = String(match["material-type"] || "").trim().toUpperCase();
    const primary = match.matgroupprimarydesc || "";
    const secondary = match.matgroupsecondarydesc || "";
    const matchUom = String(match["unit-measure"] || "").trim().toUpperCase();

    classificationPrefill.current = { type, primary, secondary };

    if (type) setMattypeselected(type);
    if (primary) setMatgroupselected(primary);
    if (secondary) setSecondarymatgroupselected(secondary);
    if (matchUom) setUom(matchUom);
    setPrefillSource(match);
  };

  useEffect(() => {
    const prefill = classificationPrefill.current;
    if (!primaryGroups.length) {
      if (!prefill?.primary) setMatgroupselected("");
      return;
    }
    if (prefill?.primary && primaryGroups.includes(prefill.primary)) {
      if (matgroupselected !== prefill.primary) {
        setMatgroupselected(prefill.primary);
      }
      return;
    }
    if (!primaryGroups.includes(matgroupselected)) {
      setMatgroupselected(primaryGroups[0]);
    }
  }, [primaryGroups, matgroupselected]);

  useEffect(() => {
    const prefill = classificationPrefill.current;
    if (!secondaryGroups.length) {
      if (!prefill?.secondary) setSecondarymatgroupselected("");
      return;
    }
    if (prefill?.secondary && secondaryGroups.includes(prefill.secondary)) {
      if (secondarymatgroupselected !== prefill.secondary) {
        setSecondarymatgroupselected(prefill.secondary);
      }
      return;
    }
    if (!secondaryGroups.includes(secondarymatgroupselected)) {
      setSecondarymatgroupselected(secondaryGroups[0]);
    }
  }, [secondaryGroups, secondarymatgroupselected]);

  const buildSemanticIndex = async () => {
    setIndexing(true);
    try {
      let done = false;
      while (!done) {
        const result = await fetch("/api/reqmatcodeall/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchSize: 80 }),
        });
        const json = await result.json();
        if (!result.ok) {
          toast.error(json.error || "Failed to build semantic index");
          return;
        }
        setEmbeddingStatus(json);
        done = Boolean(json.done);
      }
      toast.success("Semantic material index is ready.");
    } catch (error) {
      console.error(error);
      toast.error("Could not build the semantic index.");
    } finally {
      setIndexing(false);
    }
  };

  const searchSimilar = async (event) => {
    event.preventDefault();
    const spec = specification.trim();
    if (spec.length < 4) {
      toast.error("Please enter a fuller specification before searching.");
      return;
    }

    setSearching(true);
    setSelectedExisting(null);
    try {
      const result = await fetch("/api/reqmatcodeall/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specification: spec }),
      });
      const json = await result.json();
      if (!result.ok) {
        toast.error(json.error || "Search failed");
        return;
      }
      setMatches(json.matches || []);
      setTokens(json.tokens || []);
      setSearchMode(json.mode || "");
      setIndexSize(json.indexSize || 0);
      if ((json.matches || []).length > 0) {
        applyMatchClassification(json.matches[0]);
      } else {
        classificationPrefill.current = null;
        setPrefillSource(null);
      }
      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("Could not search the material master.");
    } finally {
      setSearching(false);
    }
  };

  const generateDescription = async () => {
    setGenerating(true);
    try {
      const result = await fetch("/api/reqmatcodeall/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specification: specification.trim(),
          similarMaterials: matches,
          uom,
        }),
      });
      const json = await result.json();
      if (!result.ok) {
        toast.error(json.error || "Could not generate description");
        return;
      }
      setNewdescription(json.description || "");
      if (!uom && json.suggestedUom) setUom(json.suggestedUom);
      setLongDesc(specification.trim());
      if (matches[0] && !prefillSource) {
        applyMatchClassification(matches[0]);
      }
      setStep(3);
      if (json.usedFallback) {
        toast.info("Generated a draft without OpenAI. Please review it carefully.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Description generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.info(code);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newdescription.trim()) {
      toast.error("SAP description is required.");
      return;
    }
    if (newdescription.length > 40) {
      toast.error("SAP description must be 40 characters or fewer.");
      return;
    }
    if (!uom.trim()) {
      toast.error("Unit of measure is required.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await fetch("/api/reqmatcodeall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specification: specification.trim(),
          newdescription: newdescription.trim(),
          longDesc: longDesc.trim() || specification.trim(),
          uom: uom.trim(),
          mattypeselected,
          matgroupselected,
          secondarymatgroupselected,
          similarMaterialCodes: matches.map((m) => m["material-code"]),
        }),
      });
      const json = await result.json();
      if (!result.ok) {
        toast.error(json.error || "Could not save the request");
        return;
      }
      toast.success("New material code request submitted.");
      const refreshed = await fetch("/api/reqmatcodeall");
      const list = await refreshed.json();
      setPreviousRequests(Array.isArray(list) ? list : []);
      setStep(1);
      setSpecification("");
      setUom("");
      setMatches([]);
      setTokens([]);
      setSelectedExisting(null);
      setNewdescription("");
      setLongDesc("");
      setPrefillSource(null);
      classificationPrefill.current = null;
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit the request.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedExisting(null);
    setMatches([]);
    setTokens([]);
    setNewdescription("");
    setPrefillSource(null);
    classificationPrefill.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-teal-50">
      <HeaderComponent />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-md border border-sky-100 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-700 font-bold mb-1">
                Open to all users
              </p>
              <h1 className="text-2xl font-black text-slate-800">
                Request a new material code
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                Describe the material you need. The portal will first propose
                similar codes from the material master. Only if none of those
                match will a SAP-style short description (max 40 characters) be
                generated for your new-code request.
              </p>
            </div>
            <div className="bg-teal-50 text-teal-900 text-sm px-4 py-2 rounded-lg border border-teal-200">
              Welcome <span className="font-bold">{session?.user?.name}</span>
            </div>
          </div>

          <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {STEPS.map((item) => (
              <li
                key={item.id}
                className={`rounded-lg px-4 py-3 text-sm font-semibold border ${
                  step === item.id
                    ? "bg-teal-600 text-white border-teal-600"
                    : step > item.id
                    ? "bg-teal-50 text-teal-800 border-teal-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                Step {item.id}. {item.label}
              </li>
            ))}
          </ol>
        </div>

        {step === 1 && (
          <form
            onSubmit={searchSimilar}
            className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
          >
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Required specification
            </label>
            <textarea
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Example: spiral wound gasket 2 inch 300# SS316 with inner and outer ring, graphite filler"
              required
            />
            <div className="mt-4 max-w-xs">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Unit of measure (optional now)
              </label>
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                placeholder="EA / M / KG / PAC"
              />
            </div>
            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
              <p className="font-semibold">Semantic index</p>
              <p className="mt-1">
                {embeddingStatus
                  ? `${embeddingStatus.indexed || 0} / ${embeddingStatus.materials || 0} materials in the vector store`
                  : "Checking vector store..."}
              </p>
              {embeddingStatus && embeddingStatus.indexed < embeddingStatus.materials ? (
                <p className="mt-1 text-xs">
                  Until the index is complete, search may fall back to keyword matching.
                </p>
              ) : null}
              <button
                type="button"
                disabled={indexing}
                onClick={buildSemanticIndex}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-800 border border-teal-200 hover:bg-teal-100 disabled:opacity-60"
              >
                <FiRefreshCw className={indexing ? "animate-spin" : ""} />
                {indexing
                  ? "Building semantic index..."
                  : embeddingStatus?.indexed > 0
                  ? "Update semantic index"
                  : "Build semantic index"}
              </button>
            </div>
            <button
              type="submit"
              disabled={searching}
              className="mt-6 inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              <FiSearch />
              {searching ? "Searching material master..." : "Search similar materials"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Similar materials found
                </h2>
                <p className="text-sm text-slate-600">
                  {matches.length} proposed match{matches.length === 1 ? "" : "es"}{" "}
                  for your specification.
                  {searchMode === "semantic" ? (
                    <span className="ml-1 text-teal-700 font-semibold">
                      Ranked by semantic similarity
                      {indexSize ? ` across ${indexSize} indexed materials` : ""}.
                    </span>
                  ) : tokens.length > 0 ? (
                    <span className="ml-1 text-slate-500">
                      Keyword search: {tokens.join(", ")}
                    </span>
                  ) : (
                    <span className="ml-1 text-amber-700">
                      Text search was used because the semantic index is not ready.
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <FiArrowLeft /> Edit specification
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-lg p-3 mb-4">
              Please use an existing code if it already covers your need. Click a
              proposed match to prefill material type, group, and UOM for a new
              request. A new code should be requested only when none of these
              are similar.
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <FiAlertTriangle className="mx-auto text-3xl mb-2 text-amber-500" />
                No close matches were found in the material master.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[420px] border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-left text-xs uppercase text-slate-500">
                      <th className="px-3 py-2">Match</th>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">UOM</th>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((item) => (
                      <tr
                        key={item["material-code"]}
                        onClick={() => applyMatchClassification(item)}
                        className={`border-t cursor-pointer ${
                          prefillSource?.["material-code"] === item["material-code"]
                            ? "bg-teal-50"
                            : "hover:bg-sky-50"
                        }`}
                      >
                        <td className="px-3 py-2 font-semibold text-teal-700">
                          {item.matchPercent}%
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-800">
                          {item["material-code"]}
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {item["material-description"]}
                        </td>
                        <td className="px-3 py-2">{item["material-type"]}</td>
                        <td className="px-3 py-2">{item["unit-measure"]}</td>
                        <td className="px-3 py-2">
                          <p>{item.matgroupprimarydesc || item["material-group"]}</p>
                          {item.matgroupsecondarydesc ? (
                            <p className="text-xs text-slate-500">
                              {item.matgroupsecondarydesc}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedExisting(item["material-code"]);
                              applyMatchClassification(item);
                              copyCode(item["material-code"]);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                          >
                            <FiClipboard /> Use this code
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {prefillSource && (
              <div className="mt-4 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg p-4 text-sm">
                <p className="font-bold">
                  Prefilling from {prefillSource["material-code"]}
                </p>
                <p className="mt-1">
                  Type: {prefillSource["material-type"] || "-"} · UOM:{" "}
                  {prefillSource["unit-measure"] || "-"} · Group:{" "}
                  {prefillSource.matgroupprimarydesc ||
                    prefillSource["material-group"] ||
                    "-"}
                  {prefillSource.matgroupsecondarydesc
                    ? ` / ${prefillSource.matgroupsecondarydesc}`
                    : ""}
                </p>
                <p className="text-xs mt-1 text-sky-800">
                  These values will be selected in the request form if you still
                  need a new code.
                </p>
              </div>
            )}

            {selectedExisting && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-4 flex items-start gap-3">
                <FiCheckCircle className="text-xl mt-0.5" />
                <div>
                  <p className="font-bold">
                    Use existing material {selectedExisting}
                  </p>
                  <p className="text-sm mt-1">
                    A new code is not needed. The code has been copied so you
                    can paste it into your PR / enquiry.
                  </p>
                  <button
                    type="button"
                    onClick={resetFlow}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline"
                  >
                    <FiRefreshCw /> Start another request
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={generating}
                onClick={generateDescription}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                <FiPackage />
                {generating
                  ? "Preparing SAP description..."
                  : matches.length === 0
                  ? "No similar material — generate SAP description"
                  : "None of these are similar — I still need a new code"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                New code request — SAP description
              </h2>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <FiArrowLeft /> Back to similar materials
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              This short text was generated to follow existing materials of a
              similar nature. Edit it if needed. It must stay within 40
              characters for SAP material master.
              {prefillSource ? (
                <span className="block mt-2 text-teal-800 font-semibold">
                  Type, group, and UOM were prefilled from similar material{" "}
                  {prefillSource["material-code"]}. You can still change them.
                </span>
              ) : null}
            </p>
            <button
              type="button"
              disabled={generating}
              onClick={generateDescription}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-950"
            >
              <FiRefreshCw />
              {generating ? "Regenerating..." : "Regenerate description"}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  SAP short description
                </label>
                <input
                  type="text"
                  value={newdescription}
                  maxLength={40}
                  onChange={(e) => setNewdescription(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-mono font-bold tracking-wide"
                  required
                />
                <p
                  className={`text-xs mt-1 font-semibold ${
                    newdescription.length > 40 ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {newdescription.length} / 40 characters
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Unit of measure
                </label>
                <select
                  value={uom}
                  onChange={(e) => {
                    classificationPrefill.current = null;
                    setUom(e.target.value.toUpperCase());
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2.5"
                  required
                >
                  <option value="">Select UOM</option>
                  {uomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Material type
                </label>
                <select
                  value={mattypeselected}
                  onChange={(e) => {
                    classificationPrefill.current = null;
                    setMattypeselected(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                >
                  {typeOptions.map((mt) => (
                    <option key={mt.value} value={mt.value}>
                      {mt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Primary material group
                </label>
                <select
                  value={matgroupselected}
                  onChange={(e) => {
                    classificationPrefill.current = null;
                    setMatgroupselected(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                >
                  {primaryGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Secondary material group
                </label>
                <select
                  value={secondarymatgroupselected}
                  onChange={(e) => {
                    classificationPrefill.current = null;
                    setSecondarymatgroupselected(e.target.value);
                  }}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                >
                  {secondaryGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Long description / full specification
              </label>
              <textarea
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              <FiSend />
              {submitting ? "Submitting..." : "Submit new material code request"}
            </button>
          </form>
        )}

        <section className="mt-8 bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Your previous requests from this page
          </h2>
          {previousRequests.length === 0 ? (
            <p className="text-sm text-slate-500">No requests submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Requested on</th>
                    <th className="px-3 py-2">SAP description</th>
                    <th className="px-3 py-2">UOM</th>
                    <th className="px-3 py-2">Type / groups</th>
                    <th className="px-3 py-2">Code assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {previousRequests.map((req) => (
                    <tr key={req._id} className="border-t align-top">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {req.created_at
                          ? moment(req.created_at).format("DD/MM/YYYY")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800">
                          {req.newdescription}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {req.specification}
                        </p>
                      </td>
                      <td className="px-3 py-2">{req.uom}</td>
                      <td className="px-3 py-2">
                        <p>{req.mattypeselected}</p>
                        <p className="text-xs text-slate-500">
                          {req.matgroupselected}
                        </p>
                        <p className="text-xs text-slate-500">
                          {req.secondarymatgroupselected}
                        </p>
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {req.matcode || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <div className="mt-12">
        <FooterComponent />
      </div>
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

  return {
    props: { session },
  };
}
