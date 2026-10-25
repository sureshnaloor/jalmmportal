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
  FiUpload,
  FiEdit3,
  FiDownload,
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
const MATCH_EXPORT_SLOTS = 5;

function uniqueValues(items) {
  return items.filter((value, index, all) => all.indexOf(value) === index);
}

function parseCsvText(text) {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;
  const src = String(text || "").replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      current.push(field.trim());
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      current.push(field.trim());
      field = "";
      if (current.some(Boolean)) rows.push(current);
      current = [];
    } else {
      field += ch;
    }
  }
  if (field.length || current.length) {
    current.push(field.trim());
    if (current.some(Boolean)) rows.push(current);
  }
  return rows;
}

function csvRowsToQueue(rows) {
  if (!rows.length) return [];
  const first = rows[0].map((cell) => String(cell || "").toLowerCase());
  const hasHeader =
    /^(description|specification|material description|desc|item description)$/i.test(
      first[0] || ""
    );
  const body = hasHeader ? rows.slice(1) : rows;
  return body
    .map((row) => ({
      description: String(row[0] || "").trim(),
      uom: String(row[1] || "").trim().toUpperCase(),
      type: String(row[2] || "").trim().toUpperCase(),
      group: String(row[3] || "").trim(),
    }))
    .filter((row) => row.description.length >= 4);
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildExistingMaterialsCsv(rows) {
  const headers = [
    "Original Description",
    "Original UOM",
    "Original Type",
    "Original Group",
  ];
  for (let i = 1; i <= MATCH_EXPORT_SLOTS; i += 1) {
    headers.push(
      `Existing ${i} Match %`,
      `Existing ${i} Code`,
      `Existing ${i} Description`,
      `Existing ${i} UOM`,
      `Existing ${i} Type`,
      `Existing ${i} Group`
    );
  }

  const lines = [headers.map(csvEscape).join(",")];
  rows.forEach((row) => {
    const cells = [
      row.description,
      row.uom || "",
      row.type || "",
      row.group || "",
    ];
    const matches = Array.isArray(row.matches) ? row.matches : [];
    for (let i = 0; i < MATCH_EXPORT_SLOTS; i += 1) {
      const match = matches[i];
      if (!match) {
        cells.push("", "", "", "", "", "");
        continue;
      }
      cells.push(
        match.matchPercent ?? "",
        match["material-code"] || "",
        match["material-description"] || "",
        match["unit-measure"] || "",
        match["material-type"] || "",
        match.matgroupprimarydesc || match["material-group"] || ""
      );
    }
    lines.push(cells.map(csvEscape).join(","));
  });
  return `\uFEFF${lines.join("\r\n")}`;
}

function downloadTextFile(filename, text, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  const csvInputRef = useRef(null);
  const [choices, setChoices] = useState([]);
  const [csvQueue, setCsvQueue] = useState([]);
  const [csvIndex, setCsvIndex] = useState(0);
  const [csvBatchId, setCsvBatchId] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [csvReviewActive, setCsvReviewActive] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [bulkExportProgress, setBulkExportProgress] = useState({
    done: 0,
    total: 0,
  });
  const [originalSnapshot, setOriginalSnapshot] = useState({
    description: "",
    uom: "",
    type: "",
    group: "",
  });
  const [templateSource, setTemplateSource] = useState(null);

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

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch("/api/reqmatcodeall/choices");
        if (!result.ok) return;
        const json = await result.json();
        setChoices(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error("Failed to load mapping choices", error);
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
    setOriginalSnapshot({
      description: spec,
      uom: uom.trim().toUpperCase(),
      type: "",
      group: "",
    });
    await runSearch(spec);
  };

  const runSearch = async (spec) => {
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
        return false;
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
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Could not search the material master.");
      return false;
    } finally {
      setSearching(false);
    }
  };

  const refreshChoices = async () => {
    try {
      const result = await fetch("/api/reqmatcodeall/choices");
      if (!result.ok) return;
      const json = await result.json();
      setChoices(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Failed to refresh mapping choices", error);
    }
  };

  const saveSelection = async ({
    selectionKind,
    chosenDescription,
    chosenUom,
    chosenType,
    chosenGroup,
    chosenMaterialCode,
    templateMaterialCode,
    templateDescription,
  }) => {
    const result = await fetch("/api/reqmatcodeall/choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: csvReviewActive ? "csv" : "single",
        csvRowIndex: csvReviewActive ? csvIndex : null,
        batchId: csvBatchId || null,
        selectionKind,
        originalDescription: originalSnapshot.description || specification.trim(),
        chosenDescription,
        originalUom: originalSnapshot.uom,
        chosenUom: chosenUom || "",
        originalType: originalSnapshot.type,
        chosenType: chosenType || "",
        originalGroup: originalSnapshot.group,
        chosenGroup: chosenGroup || "",
        chosenMaterialCode: chosenMaterialCode || "",
        templateMaterialCode: templateMaterialCode || "",
        templateDescription: templateDescription || "",
      }),
    });
    const json = await result.json().catch(() => ({}));
    if (!result.ok) {
      throw new Error(json.error || "Could not save the selection");
    }
    await refreshChoices();
  };

  const loadCsvRow = async (index, queue = csvQueue) => {
    const row = queue[index];
    if (!row) return;
    setCsvIndex(index);
    setSpecification(row.description);
    setUom(row.uom || "");
    setOriginalSnapshot({
      description: row.description,
      uom: row.uom || "",
      type: row.type || "",
      group: row.group || "",
    });
    setSelectedExisting(null);
    setNewdescription("");
    setLongDesc("");
    setPrefillSource(null);
    classificationPrefill.current = null;
    setTemplateSource(null);
    await runSearch(row.description);
  };

  const resetSingleRequest = () => {
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
    setOriginalSnapshot({ description: "", uom: "", type: "", group: "" });
    setTemplateSource(null);
  };

  const clearCsvBatch = () => {
    setCsvQueue([]);
    setCsvIndex(0);
    setCsvBatchId("");
    setCsvFileName("");
    setCsvReviewActive(false);
    setBulkExporting(false);
    setBulkExportProgress({ done: 0, total: 0 });
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const finishOrAdvanceCsv = async ({ resetSingle = true } = {}) => {
    if (!csvReviewActive) {
      if (resetSingle) resetSingleRequest();
      return;
    }
    const next = csvIndex + 1;
    if (next < csvQueue.length) {
      toast.success(`Saved. Next CSV row ${next + 1} of ${csvQueue.length}.`);
      await loadCsvRow(next);
      return;
    }
    toast.success("All CSV rows have been reviewed.");
    clearCsvBatch();
    resetSingleRequest();
  };

  const skipCsvRow = async () => {
    if (!csvReviewActive) return;
    const next = csvIndex + 1;
    if (next < csvQueue.length) {
      toast.info(`Skipped. Next CSV row ${next + 1} of ${csvQueue.length}.`);
      await loadCsvRow(next);
      return;
    }
    toast.info("Last CSV row skipped. Batch complete.");
    clearCsvBatch();
    resetSingleRequest();
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const queue = csvRowsToQueue(parseCsvText(text));
      if (!queue.length) {
        toast.error("No usable descriptions found. Put the description in column 1.");
        event.target.value = "";
        return;
      }
      const batchId = `csv-${Date.now()}`;
      setCsvQueue(queue);
      setCsvIndex(0);
      setCsvBatchId(batchId);
      setCsvFileName(file.name);
      setCsvReviewActive(false);
      setStep(1);
      setMatches([]);
      setTokens([]);
      setSelectedExisting(null);
      setNewdescription("");
      setLongDesc("");
      setPrefillSource(null);
      classificationPrefill.current = null;
      setTemplateSource(null);
      toast.info(
        `Loaded ${queue.length} description${queue.length === 1 ? "" : "s"} from ${file.name}. Choose an action below.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not read that CSV file.");
      event.target.value = "";
    }
  };

  const startCsvOneByOne = async () => {
    if (!csvQueue.length) {
      toast.error("Upload a CSV file first.");
      return;
    }
    setCsvReviewActive(true);
    await loadCsvRow(0, csvQueue);
  };

  const createExistingMaterialsFile = async () => {
    if (!csvQueue.length) {
      toast.error("Upload a CSV file first.");
      return;
    }
    setBulkExporting(true);
    setBulkExportProgress({ done: 0, total: csvQueue.length });
    try {
      const results = new Array(csvQueue.length);
      let cursor = 0;
      let completed = 0;
      const workerCount = Math.min(3, csvQueue.length);
      const workers = Array.from({ length: workerCount }, async () => {
        while (cursor < csvQueue.length) {
          const index = cursor;
          cursor += 1;
          const row = csvQueue[index];
          let matches = [];
          try {
            const result = await fetch("/api/reqmatcodeall/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ specification: row.description }),
            });
            const json = await result.json().catch(() => ({}));
            if (result.ok) {
              matches = Array.isArray(json.matches)
                ? json.matches.slice(0, MATCH_EXPORT_SLOTS)
                : [];
            }
          } catch (error) {
            console.error("Bulk match search failed for row", index + 1, error);
          }
          results[index] = { ...row, matches };
          completed += 1;
          setBulkExportProgress({ done: completed, total: csvQueue.length });
        }
      });
      await Promise.all(workers);
      const stamp = moment().format("YYYYMMDD-HHmm");
      const base = (csvFileName || "descriptions").replace(/\.csv$/i, "");
      downloadTextFile(
        `${base}-existing-materials-${stamp}.csv`,
        buildExistingMaterialsCsv(results)
      );
      toast.success(
        `Created a file with existing matches for ${csvQueue.length} description${csvQueue.length === 1 ? "" : "s"}.`
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not create the existing-materials file.");
    } finally {
      setBulkExporting(false);
    }
  };

  const chooseExistingCode = async (item) => {
    applyMatchClassification(item);
    setSelectedExisting(item["material-code"]);
    copyCode(item["material-code"]);
    try {
      await saveSelection({
        selectionKind: "existing",
        chosenDescription: item["material-description"] || "",
        chosenUom: item["unit-measure"] || "",
        chosenType: item["material-type"] || "",
        chosenGroup:
          item.matgroupprimarydesc || item["material-group"] || "",
        chosenMaterialCode: item["material-code"] || "",
      });
      await finishOrAdvanceCsv({ resetSingle: false });
    } catch (error) {
      toast.error(error.message || "Could not save the chosen material.");
    }
  };

  const copyAndEditForNewCode = (item) => {
    applyMatchClassification(item);
    setSelectedExisting(null);
    setTemplateSource(item);
    const templateDesc = String(item["material-description"] || "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
    setNewdescription(templateDesc.slice(0, 40));
    const spec = specification.trim();
    const templateNote = `Template from ${item["material-code"]}: ${templateDesc}`;
    setLongDesc(spec ? `${spec}\n\n${templateNote}` : templateNote);
    setStep(3);
    toast.info(
      "Copied the existing description as a template. Edit size, class, or other attributes, then submit a new-code request."
    );
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
      setTemplateSource(null);
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
    if (templateSource) {
      const templateDraft = String(templateSource["material-description"] || "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .slice(0, 40);
      if (newdescription.trim().toUpperCase() === templateDraft) {
        toast.error(
          "Edit the copied description so the different size, class, or other attributes are reflected before submitting a new code."
        );
        return;
      }
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
          copiedFromMaterialCode: templateSource?.["material-code"] || "",
          copiedFromDescription: templateSource?.["material-description"] || "",
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
      try {
        await saveSelection({
          selectionKind: templateSource ? "edited" : "new",
          chosenDescription: newdescription.trim(),
          chosenUom: uom.trim(),
          chosenType: mattypeselected,
          chosenGroup: matgroupselected,
          chosenMaterialCode: json.matcode || "",
          templateMaterialCode: templateSource?.["material-code"] || "",
          templateDescription: templateSource?.["material-description"] || "",
        });
      } catch (saveError) {
        toast.error(
          saveError.message ||
            "Request saved, but the original/chosen mapping could not be stored."
        );
      }
      await finishOrAdvanceCsv({ resetSingle: true });
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
    setTemplateSource(null);
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

          {(originalSnapshot.description || specification.trim()) && (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
                    Current specification
                    {csvReviewActive
                      ? ` · CSV row ${csvIndex + 1} of ${csvQueue.length}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                    {originalSnapshot.description || specification.trim()}
                  </p>
                  {(originalSnapshot.uom ||
                    originalSnapshot.type ||
                    originalSnapshot.group) && (
                    <p className="mt-1 text-xs text-teal-900">
                      Original UOM: {originalSnapshot.uom || "-"}
                      {originalSnapshot.type
                        ? ` · Type: ${originalSnapshot.type}`
                        : ""}
                      {originalSnapshot.group
                        ? ` · Group: ${originalSnapshot.group}`
                        : ""}
                    </p>
                  )}
                </div>
                {csvReviewActive && step > 1 ? (
                  <button
                    type="button"
                    onClick={skipCsvRow}
                    className="shrink-0 text-xs font-bold text-teal-800 underline"
                  >
                    Skip this row
                  </button>
                ) : null}
              </div>
            </div>
          )}
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
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 mb-1">
                <FiUpload /> Or upload a CSV of descriptions
              </label>
              <p className="text-xs text-slate-600 mb-3">
                First column is the specification. Optional columns 2–4 are
                original UOM, type, and group. After upload, choose whether to
                review similar materials one by one or download a file of
                existing matches.
              </p>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-teal-800"
              />
              {csvQueue.length > 0 && !csvReviewActive ? (
                <div className="mt-4 rounded-lg border border-teal-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Loaded {csvQueue.length} description
                    {csvQueue.length === 1 ? "" : "s"}
                    {csvFileName ? ` from ${csvFileName}` : ""}.
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Search does not start until you choose an action.
                  </p>
                  {bulkExporting ? (
                    <p className="mt-3 text-sm font-semibold text-teal-800">
                      Searching existing materials… {bulkExportProgress.done} /{" "}
                      {bulkExportProgress.total}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={searching || bulkExporting}
                      onClick={startCsvOneByOne}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                      <FiSearch />
                      {searching
                        ? "Searching..."
                        : "Suggest existing and display one by one"}
                    </button>
                    <button
                      type="button"
                      disabled={searching || bulkExporting}
                      onClick={createExistingMaterialsFile}
                      className="inline-flex items-center gap-2 rounded-lg border border-teal-700 bg-white px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50 disabled:opacity-60"
                    >
                      <FiDownload />
                      {bulkExporting
                        ? "Creating file..."
                        : "Create file showing existing materials"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
              <p className="font-semibold">Semantic index</p>
              <p className="mt-1">
                {embeddingStatus
                  ? `${embeddingStatus.indexed || 0} / ${embeddingStatus.materials || 0} SAP materials in the vector store`
                  : "Checking vector store..."}
              </p>
              {embeddingStatus?.indexed2 ? (
                <p className="mt-1">
                  {embeddingStatus.indexed2} consolidated master materials also
                  searched ({(embeddingStatus.indexSize ||
                    (embeddingStatus.indexed || 0) + embeddingStatus.indexed2
                  ).toLocaleString()}{" "}
                  total).
                </p>
              ) : null}
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
                        <td className="px-3 py-2">
                          <div className="flex flex-col items-start gap-1 min-w-[150px]">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                chooseExistingCode(item);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900"
                            >
                              <FiClipboard /> Use this code
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                copyAndEditForNewCode(item);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 text-left"
                            >
                              <FiEdit3 /> Copy this code and edit for new code
                            </button>
                          </div>
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
              {templateSource ? (
                <>
                  The SAP short description was copied from existing material{" "}
                  <span className="font-mono font-bold">
                    {templateSource["material-code"]}
                  </span>{" "}
                  as a template. Change the attributes that differ (size, class,
                  rating, material grade, etc.), then submit a new-code request.
                  <span className="block mt-2 text-teal-800 font-semibold">
                    Template: {templateSource["material-description"]}
                  </span>
                </>
              ) : (
                <>
                  This short text was generated to follow existing materials of a
                  similar nature. Edit it if needed. It must stay within 40
                  characters for SAP material master.
                </>
              )}
              {prefillSource ? (
                <span className="block mt-2 text-teal-800 font-semibold">
                  Type, group, and UOM were prefilled from similar material{" "}
                  {prefillSource["material-code"]}. You can still change them.
                </span>
              ) : null}
            </p>
            {!templateSource ? (
              <button
                type="button"
                disabled={generating}
                onClick={generateDescription}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-950"
              >
                <FiRefreshCw />
                {generating ? "Regenerating..." : "Regenerate description"}
              </button>
            ) : (
              <p className="mb-4 text-xs text-slate-500">
                Keep the same wording pattern as the template. Only change the
                values that are actually different for the new material.
              </p>
            )}

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
            Saved exact / similar selections
          </h2>
          {choices.length === 0 ? (
            <p className="text-sm text-slate-500">
              No mappings saved yet. Choosing an existing code or submitting a
              new-code request stores the original and chosen values here.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[360px] border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">User / time</th>
                    <th className="px-3 py-2">Original description</th>
                    <th className="px-3 py-2">Chosen description</th>
                    <th className="px-3 py-2">UOM orig / chosen</th>
                    <th className="px-3 py-2">Type orig / new</th>
                    <th className="px-3 py-2">Group orig / new</th>
                  </tr>
                </thead>
                <tbody>
                  {choices.map((item) => (
                    <tr key={item._id} className="border-t align-top">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">
                          {item.userName || item.userEmail || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.createdAt
                            ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                            : "-"}
                        </p>
                        <p className="text-xs text-teal-700 mt-1">
                          {item.selectionKind === "edited"
                            ? "Edited from template"
                            : item.selectionKind === "new"
                            ? "New code"
                            : "Existing"}
                          {item.templateMaterialCode
                            ? ` · ${item.templateMaterialCode}`
                            : item.chosenMaterialCode
                            ? ` · ${item.chosenMaterialCode}`
                            : ""}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {item.originalDescription}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {item.chosenDescription}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {item.originalUom || "-"} / {item.chosenUom || "-"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {item.originalType || "-"} / {item.chosenType || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {item.originalGroup || "-"} / {item.chosenGroup || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

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
                        {req.copiedFromMaterialCode ? (
                          <p className="text-xs text-teal-800 mt-1">
                            Edited from {req.copiedFromMaterialCode}
                          </p>
                        ) : null}
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
