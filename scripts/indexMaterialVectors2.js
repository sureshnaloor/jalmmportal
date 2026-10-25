const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const { OpenAI } = require("openai");
const XLSX = require("xlsx");

const COLLECTION = "materialembeddings2";
const MODEL = "text-embedding-3-small";
const BATCH_SIZE = 80;
const SOURCE_FILE = path.join(
  __dirname,
  "..",
  "public",
  "consolidated_material_master.xlsx"
);

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function asText(value) {
  if (value == null || value === "") return "";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  return String(value).trim();
}

function embeddingText(material) {
  const description = String(material["material-description"] || "").trim();
  const type = String(material["material-type"] || "").trim();
  const group = String(material["material-group"] || "").trim();
  const uom = String(material["unit-measure"] || "").trim();
  return [description, type && `Type ${type}`, group && `Group ${group}`, uom && `UOM ${uom}`]
    .filter(Boolean)
    .join(". ");
}

function hashText(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

function normalizeVector(vector) {
  let magnitude = 0;
  for (let i = 0; i < vector.length; i += 1) {
    magnitude += vector[i] * vector[i];
  }
  magnitude = Math.sqrt(magnitude) || 1;
  return vector.map((value) => value / magnitude);
}

function loadConsolidatedMaterials() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source file not found: ${SOURCE_FILE}`);
  }

  const workbook = XLSX.readFile(SOURCE_FILE);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  const seen = new Set();
  const materials = [];
  for (const row of rows) {
    const code = asText(row["Material Code"]);
    const description =
      asText(row["Short Material Description"]) || asText(row["Long Description"]);
    if (!code || !description || seen.has(code)) continue;
    if (description.toUpperCase() === "UNDER CONSTRUCTION -DO NOT USE") continue;
    seen.add(code);
    materials.push({
      "material-code": code,
      "material-description": description,
      "unit-measure": asText(row["Unit of Measure"]).toUpperCase(),
      "material-type": asText(row["Material Type"]).toUpperCase(),
      "material-group": asText(row["Material Group"]),
    });
  }
  return materials;
}

async function embedWithRetry(openai, texts) {
  let wait = 2000;
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      return await openai.embeddings.create({
        model: MODEL,
        input: texts,
      });
    } catch (error) {
      const status = error?.status || error?.response?.status;
      if (attempt === 6 || (status && status !== 429 && status < 500)) {
        throw error;
      }
      console.warn(
        `OpenAI embedding failed (status ${status || "unknown"}), retry ${attempt}/6 in ${wait}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, wait));
      wait = Math.min(30000, wait * 2);
    }
  }
  throw new Error("OpenAI embedding retries exhausted");
}

async function main() {
  loadEnv();
  const force = process.argv.includes("--force");
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!uri || !dbName) {
    throw new Error("MONGODB_URI and DB_NAME are required");
  }
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY is required");
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 120000,
  });
  await client.connect();
  const db = client.db(dbName);
  const embeddingsCol = db.collection(COLLECTION);
  await embeddingsCol.createIndex({ materialCode: 1 }, { unique: true });

  if (force) {
    await embeddingsCol.deleteMany({});
    console.log(`Cleared existing ${COLLECTION} documents.`);
  }

  console.log(`Reading ${SOURCE_FILE}`);
  const materials = loadConsolidatedMaterials();
  const openai = new OpenAI({ apiKey });

  const existing = new Map(
    (
      await embeddingsCol
        .find({}, { projection: { materialCode: 1, textHash: 1 } })
        .toArray()
    ).map((doc) => [doc.materialCode, doc.textHash])
  );

  const pending = materials.filter((material) => {
    const code = material["material-code"];
    return existing.get(code) !== hashText(embeddingText(material));
  });

  console.log(
    `Consolidated materials: ${materials.length}. Already indexed: ${existing.size}. To embed: ${pending.length}.`
  );

  for (let offset = 0; offset < pending.length; offset += BATCH_SIZE) {
    const batch = pending.slice(offset, offset + BATCH_SIZE);
    const texts = batch.map(embeddingText);
    const response = await embedWithRetry(openai, texts);
    const vectors = response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => normalizeVector(item.embedding));
    const now = new Date();

    await embeddingsCol.bulkWrite(
      batch.map((material, index) => {
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
                textHash: hashText(text),
                embedding: vectors[index],
                embeddingModel: MODEL,
                updatedAt: now,
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false }
    );

    console.log(`Embedded ${Math.min(offset + batch.length, pending.length)} / ${pending.length}`);
  }

  const indexed = await embeddingsCol.countDocuments();
  console.log(`Done. ${indexed} materials are in the ${COLLECTION} vector store.`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
