import crypto from "crypto";
import { OpenAI } from "openai";

export const MATERIAL_EMBEDDINGS_COLLECTION = "materialembeddings";
export const MATERIAL_EMBEDDINGS_COLLECTION_2 = "materialembeddings2";
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
const MIN_SEMANTIC_SCORE = 0.28;
const INDEX_CACHE_MS = 10 * 60 * 1000;

function getOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  return new OpenAI({ apiKey });
}

const cachedIndexes = new Map();

export function materialEmbeddingText(material) {
  const description = String(material["material-description"] || "").trim();
  const type = String(material["material-type"] || "").trim();
  const group = String(material["material-group"] || "").trim();
  const uom = String(material["unit-measure"] || "").trim();
  return [description, type && `Type ${type}`, group && `Group ${group}`, uom && `UOM ${uom}`]
    .filter(Boolean)
    .join(". ");
}

export function hashEmbeddingText(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

export function normalizeVector(vector) {
  let magnitude = 0;
  for (let i = 0; i < vector.length; i += 1) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude) || 1;
  const normalized = new Array(vector.length);
  for (let i = 0; i < vector.length; i += 1) {
    normalized[i] = vector[i] / magnitude;
  }
  return normalized;
}

export function invalidateMaterialVectorIndex() {
  cachedIndexes.clear();
}

async function ensureIndexes(db) {
  await db
    .collection(MATERIAL_EMBEDDINGS_COLLECTION)
    .createIndex({ materialCode: 1 }, { unique: true });
}

export async function embedTexts(texts) {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => normalizeVector(item.embedding));
}

export async function getEmbeddingStatus(db) {
  const [materials, indexed, indexed2] = await Promise.all([
    db.collection("materials").countDocuments({
      "material-description": { $exists: true, $nin: ["", "UNDER CONSTRUCTION -DO NOT USE"] },
    }),
    db.collection(MATERIAL_EMBEDDINGS_COLLECTION).countDocuments(),
    db.collection(MATERIAL_EMBEDDINGS_COLLECTION_2).countDocuments(),
  ]);
  return {
    materials,
    indexed,
    indexed2,
    indexSize: indexed + indexed2,
    pending: Math.max(0, materials - indexed),
    ready: indexed + indexed2 > 0,
    model: EMBEDDING_MODEL,
    collection: MATERIAL_EMBEDDINGS_COLLECTION,
    collections: [MATERIAL_EMBEDDINGS_COLLECTION, MATERIAL_EMBEDDINGS_COLLECTION_2],
  };
}

export async function indexMaterialEmbeddings(db, { batchSize = 80, force = false } = {}) {
  await ensureIndexes(db);

  const embeddingsCol = db.collection(MATERIAL_EMBEDDINGS_COLLECTION);
  if (force) {
    await embeddingsCol.deleteMany({});
    invalidateMaterialVectorIndex();
  }

  const existing = new Map(
    (
      await embeddingsCol
        .find({}, { projection: { materialCode: 1, textHash: 1 } })
        .toArray()
    ).map((doc) => [doc.materialCode, doc.textHash])
  );

  const materials = await db
    .collection("materials")
    .find({
      "material-description": { $exists: true, $nin: ["", "UNDER CONSTRUCTION -DO NOT USE"] },
    })
    .project({
      "material-code": 1,
      "material-description": 1,
      "unit-measure": 1,
      "material-group": 1,
      "material-type": 1,
    })
    .toArray();

  const pending = materials.filter((material) => {
    const code = material["material-code"];
    if (!code) return false;
    const text = materialEmbeddingText(material);
    const textHash = hashEmbeddingText(text);
    return existing.get(code) !== textHash;
  });

  const batch = pending.slice(0, Math.max(1, batchSize));
  if (batch.length === 0) {
    const status = await getEmbeddingStatus(db);
    return { processed: 0, remaining: 0, done: true, ...status };
  }

  const texts = batch.map((material) => materialEmbeddingText(material));
  const vectors = await embedTexts(texts);
  const now = new Date();

  const operations = batch.map((material, index) => {
    const text = texts[index];
    return {
      updateOne: {
        filter: { materialCode: material["material-code"] },
        update: {
          $set: {
            materialCode: material["material-code"],
            description: material["material-description"] || "",
            unitMeasure: material["unit-measure"] || "",
            materialGroup: material["material-group"] || "",
            materialType: material["material-type"] || "",
            text,
            textHash: hashEmbeddingText(text),
            embedding: vectors[index],
            embeddingModel: EMBEDDING_MODEL,
            updatedAt: now,
          },
        },
        upsert: true,
      },
    };
  });

  await embeddingsCol.bulkWrite(operations, { ordered: false });
  invalidateMaterialVectorIndex();

  const status = await getEmbeddingStatus(db);
  const remaining = Math.max(0, pending.length - batch.length);
  return {
    processed: batch.length,
    remaining,
    done: remaining === 0,
    ...status,
  };
}

export async function indexAllMaterialEmbeddings(
  db,
  { batchSize = 80, force = false, onProgress } = {}
) {
  let round = 0;
  let last;
  do {
    last = await indexMaterialEmbeddings(db, {
      batchSize,
      force: force && round === 0,
    });
    round += 1;
    if (onProgress) onProgress(last);
  } while (!last.done);
  return last;
}

async function loadVectorIndex(db, collectionName) {
  const indexed = await db.collection(collectionName).countDocuments({
    embedding: { $exists: true },
  });
  const cached = cachedIndexes.get(collectionName);
  if (
    cached &&
    cached.count === indexed &&
    Date.now() - cached.loadedAt < INDEX_CACHE_MS
  ) {
    return cached;
  }

  const dim = EMBEDDING_DIMENSIONS;
  const matrix = new Float32Array(indexed * dim);
  const meta = new Array(indexed);
  let index = 0;

  const cursor = db.collection(collectionName).find(
    { embedding: { $exists: true } },
    {
      projection: {
        materialCode: 1,
        description: 1,
        unitMeasure: 1,
        materialGroup: 1,
        materialType: 1,
        embedding: 1,
      },
      batchSize: 500,
    }
  );

  for await (const doc of cursor) {
    if (index >= indexed) break;
    const embedding = doc.embedding || [];
    const offset = index * dim;
    for (let d = 0; d < dim; d += 1) {
      matrix[offset + d] = embedding[d] || 0;
    }
    meta[index] = {
      "material-code": doc.materialCode || "",
      "material-description": doc.description || "",
      "unit-measure": doc.unitMeasure || "",
      "material-group": doc.materialGroup || "",
      "material-type": doc.materialType || "",
    };
    index += 1;
  }

  const loaded = {
    collectionName,
    count: index,
    dim,
    matrix,
    meta,
    loadedAt: Date.now(),
  };
  cachedIndexes.set(collectionName, loaded);
  return loaded;
}

function topKCosine(queryVector, index, k = 25) {
  const scores = new Array(index.count);
  for (let i = 0; i < index.count; i += 1) {
    let dot = 0;
    const offset = i * index.dim;
    for (let d = 0; d < index.dim; d += 1) {
      dot += queryVector[d] * index.matrix[offset + d];
    }
    scores[i] = { i, score: dot };
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, k);
}

export async function findSimilarMaterialsSemantic(db, specification, { limit = 25 } = {}) {
  const status = await getEmbeddingStatus(db);
  if (!status.ready) {
    return { matches: [], indexSize: 0, ready: false };
  }

  const [queryVector] = await embedTexts([specification]);
  const [primary, consolidated] = await Promise.all([
    loadVectorIndex(db, MATERIAL_EMBEDDINGS_COLLECTION),
    loadVectorIndex(db, MATERIAL_EMBEDDINGS_COLLECTION_2),
  ]);
  const indexSize = (primary.count || 0) + (consolidated.count || 0);
  if (!indexSize) {
    return { matches: [], indexSize: 0, ready: false };
  }

  const perIndex = Math.max(limit * 2, 50);
  const ranked = [];
  if (primary.count) {
    topKCosine(queryVector, primary, perIndex).forEach((item) => {
      ranked.push({ ...item, store: primary, source: MATERIAL_EMBEDDINGS_COLLECTION });
    });
  }
  if (consolidated.count) {
    topKCosine(queryVector, consolidated, perIndex).forEach((item) => {
      ranked.push({ ...item, store: consolidated, source: MATERIAL_EMBEDDINGS_COLLECTION_2 });
    });
  }

  ranked.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const matches = [];
  for (const item of ranked) {
    if (item.score < MIN_SEMANTIC_SCORE) continue;
    const material = item.store.meta[item.i];
    const code = material?.["material-code"];
    if (!code || seen.has(code)) continue;
    seen.add(code);
    matches.push({
      ...material,
      score: Number(item.score.toFixed(4)),
      matchPercent: Math.round(Math.max(0, Math.min(1, item.score)) * 100),
      matchedTerms: 1,
      embeddingSource: item.source,
    });
    if (matches.length >= limit) break;
  }

  return {
    matches,
    indexSize,
    ready: true,
  };
}
