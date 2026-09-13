/**
 * Editable schema catalog for Database Chat.
 *
 * The planner, query agent, and reviewer all receive this text.
 * Add collections, hyphenated field names, and join keys here when a
 * question is answered wrongly because the model guessed the schema.
 *
 * purchaseorders is LINE-LEVEL: group by `po-number` for PO totals.
 * Join keys often differ by punctuation: vendors.`vendor-code` ↔ POs.`vendorcode`.
 */

export const CUSTOM_SCHEMA_NOTES = `
`;

export const COLLECTION_CATALOG = {
  purchaseorders: {
    grain: "line-item (one document per PO line, not one per PO)",
    description:
      "Purchase order line items. Totals and “how many POs” MUST $group by po-number.",
    fields: [
      "po-number",
      "po-date",
      "delivery-date",
      "vendorcode",
      "vendorname",
      "plant-code",
      "pending-qty",
      "pending-val-sar",
      "po-value-sar",
      "material.matcode",
      "account.wbs",
      "account.network",
    ],
    notes: [
      "Open / pending lines: pending-val-sar > 0 (and often pending-qty > 0).",
      "Do not treat a 10-row find as the full PO list or as a total.",
      "vendorname is denormalized; vendor master still lives in vendors.",
    ],
  },
  vendors: {
    grain: "one document per vendor",
    description: "Registered vendor master.",
    fields: ["vendor-code", "vendor-name", "created_date", "created_by"],
    notes: [
      "Join to purchaseorders with vendors.vendor-code = purchaseorders.vendorcode (hyphen vs none).",
    ],
  },
  vendorsdata: {
    grain: "one document per vendor overview",
    description: "Vendor profile / contact / services overview.",
    fields: [
      "vendor-code",
      "vendor-name",
      "contact-info",
      "services-and-materials",
    ],
  },
  vendorsandtheirpo: {
    grain: "one document per vendor",
    description: "Vendors that have POs; vendorpo is an array of PO refs.",
    fields: ["vendor-code", "vendor-name", "vendorpo"],
  },
  materials: {
    grain: "one document per material code",
    description: "Material master.",
    fields: [
      "material-code",
      "material-description",
      "material-type",
      "material-group",
      "unit-measure",
      "updated-date",
    ],
    notes: [
      "Search descriptions with case-insensitive $regex on material-description.",
      "Join to PO lines via materials.material-code = purchaseorders.material.matcode.",
    ],
  },
  materialgroups: {
    grain: "one document per group",
    description: "Material group lookup.",
    fields: ["name"],
  },
  materialsubgroups: {
    grain: "one document per subgroup",
    description: "Material subgroup; groupId references materialgroups._id.",
    fields: ["name", "groupId"],
  },
  materialsubgroupmap: {
    grain: "mapping row",
    description: "Maps materialCode to a subgroup.",
    fields: ["materialCode"],
  },
  materialdocuments: {
    grain: "movement / issue document",
    fields: ["material-code"],
  },
  projects: {
    grain: "one document per project",
    fields: ["project-wbs"],
    notes: [
      "PO assignment uses purchaseorders.account.wbs (often first 12 chars of WBS).",
    ],
  },
  networks: {
    grain: "one document per network",
    fields: ["network-num", "project-wbs"],
  },
  openrequisitions: {
    grain: "requisition / PR line",
    description: "Open purchase requisitions.",
  },
  poschedule: {
    grain: "one document per PO schedule",
    fields: ["ponumber"],
    notes: ["Key is ponumber (no hyphen), not po-number."],
  },
  pocomments: {
    grain: "one document per comment",
    fields: ["ponumber", "title", "updatedAt", "updatedBy"],
    notes: ["Join to purchaseorders via pocomments.ponumber = purchaseorders.po-number."],
  },
  vendorevaluation: {
    grain: "one document per vendor evaluation",
    fields: ["vendorcode"],
  },
  vendordocuments: {
    grain: "uploaded vendor document",
    fields: ["vendorCode"],
    notes: ["camelCase vendorCode, not vendor-code."],
  },
  vendoraddress: {
    grain: "vendor address",
    fields: ["vendorcode"],
  },
  vendorgroupmap: {
    grain: "vendor to material-group mapping",
    fields: ["vendor-code"],
  },
  completestock: {
    grain: "stock row",
    fields: ["material-code", "current-stkval"],
  },
  specialstock: {
    grain: "special stock row",
    fields: ["stock-val"],
  },
  dailymeetings: {
    grain: "meeting / follow-up item",
  },
};

export const JOIN_MAP = [
  {
    from: "vendors",
    localField: "vendor-code",
    to: "purchaseorders",
    foreignField: "vendorcode",
    note: "Hyphenated master key vs unhyphenated PO key. Primary vendor↔PO join.",
  },
  {
    from: "vendors",
    localField: "vendor-code",
    to: "vendorevaluation",
    foreignField: "vendorcode",
  },
  {
    from: "vendors",
    localField: "vendor-code",
    to: "vendorsandtheirpo",
    foreignField: "vendor-code",
  },
  {
    from: "vendors",
    localField: "vendor-code",
    to: "vendordocuments",
    foreignField: "vendorCode",
  },
  {
    from: "vendors",
    localField: "vendor-code",
    to: "vendoraddress",
    foreignField: "vendorcode",
  },
  {
    from: "materials",
    localField: "material-code",
    to: "purchaseorders",
    foreignField: "material.matcode",
  },
  {
    from: "projects",
    localField: "project-wbs",
    to: "purchaseorders",
    foreignField: "account.wbs",
    note: "PO WBS is often a longer string; match on the first 12 characters when needed.",
  },
  {
    from: "poschedule",
    localField: "ponumber",
    to: "purchaseorders",
    foreignField: "po-number",
  },
  {
    from: "pocomments",
    localField: "ponumber",
    to: "purchaseorders",
    foreignField: "po-number",
  },
];

const KEYWORD_HINTS = [
  {
    test: /purchase\s*order|\bpos?\b|\bpo[- ]number|open po|pending val/i,
    collections: ["purchaseorders"],
  },
  { test: /vendor/i, collections: ["vendors", "vendorsandtheirpo"] },
  { test: /material group/i, collections: ["materialgroups", "materials"] },
  { test: /material/i, collections: ["materials"] },
  { test: /requisition|\bpr\b/i, collections: ["openrequisitions"] },
  { test: /schedule/i, collections: ["poschedule"] },
  { test: /comment/i, collections: ["pocomments"] },
  { test: /evaluat/i, collections: ["vendorevaluation"] },
  { test: /project|wbs|network/i, collections: ["projects", "networks", "purchaseorders"] },
  { test: /stock/i, collections: ["completestock", "specialstock"] },
  { test: /meeting/i, collections: ["dailymeetings"] },
];

export function guessCollectionsFromQuestion(question) {
  const names = new Set();
  const text = String(question || "");
  for (const hint of KEYWORD_HINTS) {
    if (hint.test.test(text)) {
      hint.collections.forEach((name) => names.add(name));
    }
  }
  return [...names];
}

export function questionLooksLikeGrouping(question) {
  return /\b(group|grouped|each vendor|per vendor|per po|by vendor|by plant|by material|sum|total|count of|how many pos|aggregate)\b/i.test(
    String(question || "")
  );
}

export function questionLooksLikeJoin(question) {
  return /\b(join|lookup|with vendor|and their|together with|related|from both|across)\b/i.test(
    String(question || "")
  );
}

function formatCollectionEntry(name, entry) {
  if (!entry) return `- ${name}`;
  const fields = Array.isArray(entry.fields) ? entry.fields.join(", ") : "";
  const notes = Array.isArray(entry.notes) ? entry.notes.map((n) => `    • ${n}`).join("\n") : "";
  return [
    `- ${name}${entry.grain ? ` [${entry.grain}]` : ""}`,
    entry.description ? `    ${entry.description}` : "",
    fields ? `    fields: ${fields}` : "",
    notes,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildCatalogPrompt(collectionNames) {
  const wanted = Array.isArray(collectionNames) && collectionNames.length
    ? collectionNames
    : Object.keys(COLLECTION_CATALOG);

  const unique = [...new Set(wanted)];
  const known = unique.filter((name) => COLLECTION_CATALOG[name]);
  const unknown = unique.filter((name) => !COLLECTION_CATALOG[name]);

  const joins = JOIN_MAP.filter(
    (join) => unique.includes(join.from) || unique.includes(join.to)
  );

  const joinLines = (joins.length ? joins : JOIN_MAP)
    .map(
      (join) =>
        `- ${join.from}.${join.localField} = ${join.to}.${join.foreignField}${
          join.note ? ` (${join.note})` : ""
        }`
    )
    .join("\n");

  const extra = String(CUSTOM_SCHEMA_NOTES || "").trim();

  return [
    "Known collection schemas (edit lib/mcp/collectionCatalog.js to extend):",
    known.map((name) => formatCollectionEntry(name, COLLECTION_CATALOG[name])).join("\n"),
    unknown.length ? `Also planned (infer schema with collection-schema): ${unknown.join(", ")}` : "",
    "Joins (use aggregate $lookup with these keys; MongoDB 4.2 simple form only):",
    joinLines,
    extra ? `Additional schema notes from the operator:\n${extra}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
