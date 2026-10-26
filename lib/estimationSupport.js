import { toNumeric } from "./openBalances";
import { BULK_BATCH_SIZE, BULK_PO_SLOTS } from "./estimationBulkSheet";
import {
  MATERIAL_EMBEDDINGS_COLLECTION,
  findClosestMaterialsSemantic,
  findSimilarMaterialsSemantic,
} from "./materialVectorSearch";

const LOW_CONFIDENCE_SCORE = 0.28;

export function materialCodeFilter(code) {
  const text = String(code || "").trim();
  const values = [text];
  if (/^\d+$/.test(text)) {
    const asNumber = Number(text);
    if (Number.isSafeInteger(asNumber)) values.push(asNumber);
  }
  return { $in: values };
}

function roundMoney(value) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.round(value * 10000) / 10000;
}

function toIsoDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function mapPurchaseOrder(doc) {
  return {
    poNumber: doc["po-number"] || "",
    poLine: doc["po-line-item"] == null ? "" : String(doc["po-line-item"]),
    poDate: toIsoDate(doc["po-date"]),
    vendorCode: doc.vendorcode || doc["vendor-code"] || "",
    vendorName: doc.vendorname || doc["vendor-name"] || "",
    unitPrice: toNumeric(doc["po-unit-price"]),
    currency: doc.currency || "",
    quantity: toNumeric(doc["po-quantity"]),
    uom: doc["po-unit-of-measure"] || "",
    valueSar: toNumeric(doc["po-value-sar"]),
    plant: doc["plant-code"] || "",
  };
}

function sortPurchaseOrders(orders) {
  return orders.sort((a, b) => {
    const aTime = a.poDate ? new Date(a.poDate).getTime() : 0;
    const bTime = b.poDate ? new Date(b.poDate).getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return String(b.poNumber).localeCompare(String(a.poNumber));
  });
}

const PO_LIST_PROJECTION = {
  "po-number": 1,
  "po-line-item": 1,
  "po-date": 1,
  vendorcode: 1,
  "vendor-code": 1,
  vendorname: 1,
  "vendor-name": 1,
  "po-unit-price": 1,
  currency: 1,
  "po-quantity": 1,
  "po-unit-of-measure": 1,
  "po-value-sar": 1,
  "plant-code": 1,
  "material.matcode": 1,
};

function stockRow(doc, stockType, qtyField, valueField) {
  const quantity = toNumeric(doc[qtyField]);
  const valueSar = toNumeric(doc[valueField]);
  return {
    stockType,
    plant: doc["plant-code"] || "",
    uom: doc["unit-of-measure"] || "",
    quantity,
    valueSar,
    unitPriceSar: quantity ? roundMoney(valueSar / quantity) : null,
    wbs: doc["wbs-element"] || "",
    indicator: doc["stk-indicator"] || "",
  };
}

export async function searchEstimationMaterial(db, description, { limit = 8 } = {}) {
  const semantic = await findSimilarMaterialsSemantic(db, description, {
    limit,
    collections: [MATERIAL_EMBEDDINGS_COLLECTION],
    minScore: 0,
  });

  const matches = (semantic.matches || []).map((match, index) => ({
    ...match,
    rank: index + 1,
    lowConfidence: Number(match.score) < LOW_CONFIDENCE_SCORE,
  }));

  return {
    ready: semantic.ready,
    indexSize: semantic.indexSize || 0,
    best: matches[0] || null,
    alternatives: matches.slice(1),
    matches,
  };
}

export async function fetchEstimationPrices(db, materialCode) {
  const code = String(materialCode || "").trim();
  const filter = materialCodeFilter(code);

  const [completeDocs, specialDocs, poDocs, material] = await Promise.all([
    db.collection("completestock").find({ "material-code": filter }).toArray(),
    db.collection("specialstock").find({ "material-code": filter }).toArray(),
    db.collection("purchaseorders").find({ "material.matcode": filter }).toArray(),
    db
      .collection("materials")
      .findOne(
        { "material-code": filter },
        {
          projection: {
            "material-code": 1,
            "material-description": 1,
            "unit-measure": 1,
            "material-group": 1,
            "material-type": 1,
          },
        }
      ),
  ]);

  const stock = [
    ...completeDocs.map((doc) =>
      stockRow(doc, "Complete stock", "current-stkqty", "current-stkval")
    ),
    ...specialDocs.map((doc) => stockRow(doc, "Special stock", "stock-qty", "stock-val")),
  ].filter((row) => row.quantity > 0 || row.valueSar > 0);

  const purchaseOrders = sortPurchaseOrders(poDocs.map(mapPurchaseOrder));

  const quantity = stock.reduce((sum, row) => sum + row.quantity, 0);
  const valueSar = stock.reduce((sum, row) => sum + row.valueSar, 0);

  return {
    material: {
      code: material?.["material-code"] || code,
      description: material?.["material-description"] || "",
      uom: material?.["unit-measure"] || "",
      group: material?.["material-group"] || "",
      type: material?.["material-type"] || "",
    },
    stock,
    stockSummary: {
      rowCount: stock.length,
      quantity,
      valueSar,
      unitPriceSar: quantity ? roundMoney(valueSar / quantity) : null,
    },
    purchaseOrders,
    poCount: purchaseOrders.length,
  };
}

function emptyStockSummary() {
  return { rowCount: 0, quantity: 0, valueSar: 0, unitPriceSar: null };
}

function summarizeStockDocs(completeDocs, specialDocs) {
  const stock = [
    ...completeDocs.map((doc) =>
      stockRow(doc, "Complete stock", "current-stkqty", "current-stkval")
    ),
    ...specialDocs.map((doc) => stockRow(doc, "Special stock", "stock-qty", "stock-val")),
  ].filter((row) => row.quantity > 0 || row.valueSar > 0);
  const quantity = stock.reduce((sum, row) => sum + row.quantity, 0);
  const valueSar = stock.reduce((sum, row) => sum + row.valueSar, 0);
  return {
    rowCount: stock.length,
    quantity,
    valueSar,
    unitPriceSar: quantity ? roundMoney(valueSar / quantity) : null,
  };
}

function expandMaterialCodes(codes) {
  const values = [];
  const seen = new Set();
  codes.forEach((code) => {
    const text = String(code || "").trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    values.push(text);
    if (/^\d+$/.test(text)) {
      const asNumber = Number(text);
      if (Number.isSafeInteger(asNumber)) values.push(asNumber);
    }
  });
  return values;
}

async function loadBulkPriceMap(db, materialCodes) {
  const codes = [...new Set(materialCodes.map((code) => String(code || "").trim()).filter(Boolean))];
  const priceByCode = new Map();
  if (!codes.length) return priceByCode;

  const codeValues = expandMaterialCodes(codes);
  const [completeDocs, specialDocs] = await Promise.all([
    db
      .collection("completestock")
      .find({ "material-code": { $in: codeValues } })
      .project({
        "material-code": 1,
        "plant-code": 1,
        "unit-of-measure": 1,
        "current-stkqty": 1,
        "current-stkval": 1,
      })
      .toArray(),
    db
      .collection("specialstock")
      .find({ "material-code": { $in: codeValues } })
      .project({
        "material-code": 1,
        "plant-code": 1,
        "unit-of-measure": 1,
        "stock-qty": 1,
        "stock-val": 1,
        "wbs-element": 1,
        "stk-indicator": 1,
      })
      .toArray(),
  ]);

  const completeByCode = new Map();
  const specialByCode = new Map();
  completeDocs.forEach((doc) => {
    const key = String(doc["material-code"] ?? "").trim();
    if (!completeByCode.has(key)) completeByCode.set(key, []);
    completeByCode.get(key).push(doc);
  });
  specialDocs.forEach((doc) => {
    const key = String(doc["material-code"] ?? "").trim();
    if (!specialByCode.has(key)) specialByCode.set(key, []);
    specialByCode.get(key).push(doc);
  });

  await Promise.all(
    codes.map(async (code) => {
      const filter = { "material.matcode": materialCodeFilter(code) };
      const [poDocs, poCount] = await Promise.all([
        db
          .collection("purchaseorders")
          .find(filter)
          .project(PO_LIST_PROJECTION)
          .sort({ "po-date": -1 })
          .limit(BULK_PO_SLOTS)
          .toArray(),
        db.collection("purchaseorders").countDocuments(filter),
      ]);
      priceByCode.set(code, {
        stockSummary: summarizeStockDocs(completeByCode.get(code) || [], specialByCode.get(code) || []),
        purchaseOrders: sortPurchaseOrders(poDocs.map(mapPurchaseOrder)).slice(0, BULK_PO_SLOTS),
        poCount,
      });
    })
  );

  return priceByCode;
}

export async function matchEstimationBatch(db, items) {
  const prepared = (Array.isArray(items) ? items : [])
    .slice(0, BULK_BATCH_SIZE)
    .map((item, index) => ({
      line: Number(item?.line) || index + 1,
      sourceRow: Number(item?.sourceRow) || Number(item?.line) || index + 1,
      description: String(item?.description || "").trim(),
    }));

  const searchableIndexes = [];
  prepared.forEach((item, index) => {
    if (item.description.length >= 3) searchableIndexes.push(index);
  });

  let semantic = { ready: true, indexSize: 0, matches: [] };
  if (searchableIndexes.length) {
    semantic = await findClosestMaterialsSemantic(
      db,
      searchableIndexes.map((index) => prepared[index].description)
    );
    if (!semantic.ready) {
      return { ready: false, indexSize: 0, rows: [] };
    }
  }

  const proposedByIndex = new Map();
  searchableIndexes.forEach((itemIndex, matchIndex) => {
    proposedByIndex.set(itemIndex, semantic.matches[matchIndex] || null);
  });

  const priceByCode = await loadBulkPriceMap(
    db,
    [...proposedByIndex.values()]
      .map((match) => match?.["material-code"])
      .filter(Boolean)
  );

  const rows = prepared.map((item, index) => {
    if (item.description.length < 3) {
      return {
        ...item,
        proposed: null,
        stockSummary: emptyStockSummary(),
        purchaseOrders: [],
        poCount: 0,
        note: "Description is too short to match.",
      };
    }

    const proposed = proposedByIndex.get(index) || null;
    const code = proposed?.["material-code"] || "";
    const prices = code ? priceByCode.get(String(code)) : null;
    return {
      ...item,
      proposed: proposed
        ? {
            code: proposed["material-code"] || "",
            description: proposed["material-description"] || "",
            uom: proposed["unit-measure"] || "",
            group: proposed["material-group"] || "",
            type: proposed["material-type"] || "",
            score: proposed.score,
            matchPercent: proposed.matchPercent,
            lowConfidence: Boolean(proposed.lowConfidence),
          }
        : null,
      stockSummary: prices?.stockSummary || emptyStockSummary(),
      purchaseOrders: prices?.purchaseOrders || [],
      poCount: prices?.poCount || 0,
      note: proposed ? "" : "No proposed material was found.",
    };
  });

  return { ready: true, indexSize: semantic.indexSize || 0, rows };
}
