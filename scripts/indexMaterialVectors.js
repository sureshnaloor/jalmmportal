const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const { OpenAI } = require("openai");

const COLLECTION = "materialembeddings";
const MODEL = "text-embedding-3-small";
const BATCH_SIZE = 80;

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
  });
  await client.connect();
  const db = client.db(dbName);
  const embeddingsCol = db.collection(COLLECTION);
  await embeddingsCol.createIndex({ materialCode: 1 }, { unique: true });

  if (force) {
    await embeddingsCol.deleteMany({});
    console.log("Cleared existing material embeddings.");
  }

  const openai = new OpenAI({ apiKey });
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

  const existing = new Map(
    (await embeddingsCol.find({}, { projection: { materialCode: 1, textHash: 1 } }).toArray()).map(
      (doc) => [doc.materialCode, doc.textHash]
    )
  );

  const pending = materials.filter((material) => {
    const code = material["material-code"];
    if (!code) return false;
    return existing.get(code) !== hashText(embeddingText(material));
  });

  console.log(
    `Materials: ${materials.length}. Already indexed: ${existing.size}. To embed: ${pending.length}.`
  );

  for (let offset = 0; offset < pending.length; offset += BATCH_SIZE) {
    const batch = pending.slice(offset, offset + BATCH_SIZE);
    const texts = batch.map(embeddingText);
    const response = await openai.embeddings.create({
      model: MODEL,
      input: texts,
    });
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
