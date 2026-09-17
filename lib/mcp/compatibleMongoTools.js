const { MongoClient } = require("mongodb");
const { EJSON } = require("bson");

const ALLOWED_MCP_TOOLS = new Set([
  "find",
  "aggregate",
  "aggregate-db",
  "count",
  "list-databases",
  "list-collections",
  "collection-schema",
  "collection-indexes",
  "collection-storage-size",
  "db-stats",
  "explain",
  "list-connections",
]);

const BLOCKED_COLLECTIONS = new Set([
  "users",
  "accounts",
  "sessions",
  "verificationtokens",
  "verification_tokens",
]);

const BLOCKED_DATABASES = new Set(["admin", "local", "config"]);
const WRITE_AGGREGATE_STAGES = new Set(["$out", "$merge"]);
const MAX_FIND_LIMIT = 50;
const MAX_AGGREGATE_LIMIT = 100;

function getAppDatabaseName() {
  return process.env.DB_NAME || process.env.MDB_MCP_DB || "mmportal";
}

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function reviveExtendedJson(value) {
  if (value == null) return value;
  try {
    return EJSON.parse(JSON.stringify(value), { relaxed: true });
  } catch {
    return value;
  }
}

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/;
const DATE_COMPARE_OPS = new Set(["$gte", "$gt", "$lte", "$lt", "$eq", "$ne"]);

function isIsoDateString(value) {
  return (
    typeof value === "string" &&
    ISO_DATE_RE.test(value.trim()) &&
    !Number.isNaN(Date.parse(value))
  );
}

function looksLikeDateField(name) {
  const raw = String(name || "");
  const n = raw.replace(/^\$/, "");
  if (/^toDate$|^dateFrom|^dateToString$|^dateToParts$|^dateAdd$|^dateSub|^dateDiff$|^dateTrunc$|^isoDate/i.test(n)) {
    return false;
  }
  return /(^|[-_.])date$|^date$|created_at|updated_at/i.test(n);
}

function coerceDateFieldValue(nested) {
  if (isIsoDateString(nested)) return new Date(nested);
  if (nested instanceof Date) return nested;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const out = {};
    for (const [op, val] of Object.entries(nested)) {
      if (DATE_COMPARE_OPS.has(op) && isIsoDateString(val)) {
        out[op] = new Date(val);
      } else if ((op === "$in" || op === "$nin") && Array.isArray(val)) {
        out[op] = val.map((item) =>
          isIsoDateString(item) ? new Date(item) : coerceIsoDateComparisons(item)
        );
      } else {
        out[op] = coerceIsoDateComparisons(val);
      }
    }
    return out;
  }
  return coerceIsoDateComparisons(nested);
}

function coerceIsoDateComparisons(value) {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(coerceIsoDateComparisons);

  const patched = { ...value };
  for (const op of DATE_COMPARE_OPS) {
    if (!Array.isArray(patched[op]) || patched[op].length !== 2) continue;
    const [left, right] = patched[op];
    const leftField = typeof left === "string" && left.startsWith("$");
    const rightField = typeof right === "string" && right.startsWith("$");
    if (leftField && isIsoDateString(right) && looksLikeDateField(left)) {
      patched[op] = [left, { $toDate: right }];
    } else if (rightField && isIsoDateString(left) && looksLikeDateField(right)) {
      patched[op] = [{ $toDate: left }, right];
    } else {
      patched[op] = [
        coerceIsoDateComparisons(left),
        coerceIsoDateComparisons(right),
      ];
    }
  }

  const out = {};
  for (const [key, nested] of Object.entries(patched)) {
    if (DATE_COMPARE_OPS.has(key) && Array.isArray(nested)) {
      out[key] = nested;
      continue;
    }
    out[key] = looksLikeDateField(key)
      ? coerceDateFieldValue(nested)
      : coerceIsoDateComparisons(nested);
  }
  return out;
}

function normalizeGroupAccumulators(stage) {
  const group = stage && stage.$group;
  if (!group || typeof group !== "object") return stage;
  const next = {};
  for (const [field, spec] of Object.entries(group)) {
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      next[field] = spec;
      continue;
    }
    const accum = {};
    for (const [op, val] of Object.entries(spec)) {
      const trimmed = String(op).trim();
      const name = trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
      accum[name] = val;
    }
    next[field] = accum;
  }
  return { ...stage, $group: next };
}

function safeUnwindStage(stage) {
  const unwind = stage.$unwind;
  if (typeof unwind === "string") {
    return { $unwind: { path: unwind, preserveNullAndEmptyArrays: true } };
  }
  if (unwind && typeof unwind === "object") {
    return {
      $unwind: {
        ...unwind,
        preserveNullAndEmptyArrays: true,
      },
    };
  }
  return stage;
}

function normalizeAggregatePipeline(pipeline, maxLimit = MAX_AGGREGATE_LIMIT) {
  const cleaned = [];
  let seenGroupOrSort = false;
  let lastLimit = maxLimit;
  for (const stage of pipeline || []) {
    if (!stage || typeof stage !== "object" || Array.isArray(stage)) continue;
    if ("$unwind" in stage) {
      cleaned.push(safeUnwindStage(stage));
      continue;
    }
    if ("$group" in stage) {
      seenGroupOrSort = true;
      cleaned.push(normalizeGroupAccumulators(stage));
      continue;
    }
    if ("$group" in stage || "$sort" in stage) seenGroupOrSort = true;
    if ("$limit" in stage) {
      const n = Number(stage.$limit);
      const capped = Number.isFinite(n)
        ? Math.min(Math.max(1, n), maxLimit)
        : maxLimit;
      lastLimit = capped;
      if (!seenGroupOrSort) continue;
      cleaned.push({ $limit: capped });
      continue;
    }
    cleaned.push(stage);
  }
  const last = cleaned[cleaned.length - 1];
  if (!last || !("$limit" in last)) {
    cleaned.push({ $limit: lastLimit });
  }
  return cleaned;
}

function assertReadOnlyToolCall(name, rawArgs = {}) {
  if (!ALLOWED_MCP_TOOLS.has(name)) {
    throw new Error(
      `Tool "${name}" is not allowed. This chat can only fetch data (read-only).`
    );
  }

  const args = { ...asObject(rawArgs) };
  const appDb = getAppDatabaseName();

  if (args.database) {
    const dbName = String(args.database);
    if (BLOCKED_DATABASES.has(dbName)) {
      throw new Error(`Database "${dbName}" cannot be queried.`);
    }
    if (dbName !== appDb && name !== "list-databases") {
      throw new Error(
        `Only the application database "${appDb}" can be queried.`
      );
    }
  }

  if (args.collection) {
    const collection = String(args.collection);
    if (BLOCKED_COLLECTIONS.has(collection.toLowerCase())) {
      throw new Error(
        `Collection "${collection}" is restricted and cannot be queried.`
      );
    }
  }

  if (name === "find") {
    const requested = Number(args.limit);
    args.limit = Number.isFinite(requested)
      ? Math.min(Math.max(1, requested), MAX_FIND_LIMIT)
      : 10;
  }

  if (name === "aggregate" || name === "aggregate-db") {
    const pipeline = Array.isArray(args.pipeline) ? args.pipeline : [];
    for (const stage of pipeline) {
      if (!stage || typeof stage !== "object") continue;
      const stageName = Object.keys(stage)[0];
      if (WRITE_AGGREGATE_STAGES.has(stageName)) {
        throw new Error(
          `Aggregation stage ${stageName} is a write and is not allowed.`
        );
      }
    }
    args.pipeline = normalizeAggregatePipeline(pipeline, MAX_AGGREGATE_LIMIT);
  }

  return args;
}

function jsonSafe(value) {
  if (value == null) return value;
  if (typeof value.toHexString === "function" && value._bsontype) {
    return value.toHexString();
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    return `<Buffer ${value.length} bytes>`;
  }
  if (typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = jsonSafe(nested);
    }
    return out;
  }
  return value;
}

function typeOfValue(value) {
  if (value == null) return "null";
  if (typeof value.toHexString === "function" && value._bsontype) return "objectId";
  if (value instanceof Date) return "date";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function mergeSchema(target, sample) {
  if (!sample || typeof sample !== "object" || Array.isArray(sample)) return;
  for (const [key, value] of Object.entries(sample)) {
    const type = typeOfValue(value);
    if (!target[key]) {
      target[key] = { types: new Set([type]) };
    } else {
      target[key].types.add(type);
    }
    if (type === "object") {
      target[key].fields = target[key].fields || {};
      mergeSchema(target[key].fields, value);
    }
  }
}

function schemaToObject(schema) {
  const out = {};
  for (const [key, info] of Object.entries(schema)) {
    out[key] = {
      types: [...info.types],
    };
    if (info.fields) out[key].fields = schemaToObject(info.fields);
  }
  return out;
}

async function getClient() {
  if (!global._mmportalCompatMongo) {
    const uri = process.env.MONGODB_URI || process.env.MDB_MCP_CONNECTION_STRING;
    if (!uri) {
      throw new Error("MONGODB_URI is not configured.");
    }
    const client = new MongoClient(uri);
    global._mmportalCompatMongo = client.connect();
  }
  return global._mmportalCompatMongo;
}

async function getDb(dbName) {
  const client = await getClient();
  return client.db(dbName || getAppDatabaseName());
}

const COMPATIBLE_TOOL_DEFS = [
  {
    name: "list-connections",
    description: "List the active MongoDB connections",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list-databases",
    description: "List databases on this MongoDB server",
    inputSchema: {
      type: "object",
      properties: { connectionId: { type: "string" } },
    },
  },
  {
    name: "list-collections",
    description: "List collections in a database",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
      },
      required: ["database"],
    },
  },
  {
    name: "collection-schema",
    description: "Infer field names and types from sample documents",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
        sampleSize: { type: "number" },
      },
      required: ["database", "collection"],
    },
  },
  {
    name: "collection-indexes",
    description: "List indexes for a collection",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
      },
      required: ["database", "collection"],
    },
  },
  {
    name: "collection-storage-size",
    description: "Get collection storage stats",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
      },
      required: ["database", "collection"],
    },
  },
  {
    name: "db-stats",
    description: "Get database statistics",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
      },
      required: ["database"],
    },
  },
  {
    name: "count",
    description: "Count documents in a collection, optionally filtered",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
        query: { type: "object" },
      },
      required: ["database", "collection"],
    },
  },
  {
    name: "find",
    description: "Run a find query against a collection",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
        filter: { type: "object" },
        projection: { type: "object" },
        sort: { type: "object" },
        limit: { type: "number" },
      },
      required: ["database", "collection"],
    },
  },
  {
    name: "aggregate",
    description: "Run a read-only aggregation pipeline against a collection",
    inputSchema: {
      type: "object",
      properties: {
        connectionId: { type: "string" },
        database: { type: "string" },
        collection: { type: "string" },
        pipeline: { type: "array" },
      },
      required: ["database", "collection", "pipeline"],
    },
  },
];

async function runTool(name, args) {
  const dbName = args.database || getAppDatabaseName();
  const db = await getDb(dbName);

  switch (name) {
    case "list-connections":
      return {
        connections: [
          {
            connectionId: "preconfigured",
            name: getAppDatabaseName(),
            source: "preconfigured",
            state: "connected",
            description: "Application MongoDB (driver compatible with MongoDB 4.2)",
          },
        ],
      };
    case "list-databases": {
      const admin = (await getClient()).db().admin();
      try {
        const { databases } = await admin.listDatabases();
        return {
          databases: (databases || [])
            .filter((item) => !["admin", "local", "config"].includes(item.name))
            .map((item) => ({ name: item.name, sizeOnDisk: item.sizeOnDisk })),
        };
      } catch {
        return { databases: [{ name: getAppDatabaseName() }] };
      }
    }
    case "list-collections": {
      const cols = await db.listCollections({}, { nameOnly: true }).toArray();
      const collections = cols
        .map((col) => ({ name: col.name }))
        .filter((col) => !BLOCKED_COLLECTIONS.has(col.name.toLowerCase()));
      return { collections, totalCount: collections.length };
    }
    case "collection-schema": {
      const sampleSize = Math.min(Number(args.sampleSize) || 50, 50);
      const docs = await db
        .collection(args.collection)
        .find({})
        .limit(sampleSize)
        .toArray();
      const schema = {};
      docs.forEach((doc) => mergeSchema(schema, doc));
      return {
        collection: args.collection,
        sampleSize: docs.length,
        fields: schemaToObject(schema),
      };
    }
    case "collection-indexes": {
      const indexes = await db.collection(args.collection).indexes();
      return { indexes: jsonSafe(indexes) };
    }
    case "collection-storage-size": {
      const stats = await db.command({ collStats: args.collection });
      return {
        collection: args.collection,
        count: stats.count,
        size: stats.size,
        storageSize: stats.storageSize,
      };
    }
    case "db-stats":
      return jsonSafe(await db.stats());
    case "count": {
      args.query = coerceIsoDateComparisons(
        reviveExtendedJson(
          args.query && typeof args.query === "object" ? args.query : {}
        )
      );
      const n = await db.collection(args.collection).countDocuments(args.query);
      return { count: n };
    }
    case "find": {
      args.filter = coerceIsoDateComparisons(
        reviveExtendedJson(
          args.filter && typeof args.filter === "object" ? args.filter : {}
        )
      );
      let cursor = db.collection(args.collection).find(args.filter);
      if (args.projection && typeof args.projection === "object") {
        cursor = cursor.project(args.projection);
      }
      if (args.sort && typeof args.sort === "object") {
        cursor = cursor.sort(args.sort);
      }
      const limit = Number(args.limit) || 10;
      const documents = jsonSafe(await cursor.limit(limit).toArray());
      return { documents, queryResultsCount: documents.length };
    }
    case "aggregate":
    case "aggregate-db": {
      args.pipeline = coerceIsoDateComparisons(
        reviveExtendedJson(Array.isArray(args.pipeline) ? args.pipeline : [])
      );
      const documents = jsonSafe(
        await db.collection(args.collection).aggregate(args.pipeline).toArray()
      );
      return { documents, queryResultsCount: documents.length };
    }
    default:
      throw new Error(`Unsupported read tool "${name}"`);
  }
}

async function executeCompatibleTool(name, rawArgs) {
  if (!ALLOWED_MCP_TOOLS.has(name)) {
    throw new Error(`Tool "${name}" is not allowed.`);
  }
  const args = assertReadOnlyToolCall(name, rawArgs);
  const structured = await runTool(name, args);
  return {
    args,
    structured,
    text: JSON.stringify(structured, null, 2),
    result: { structuredContent: structured, isError: false },
  };
}

function listCompatibleTools() {
  return { tools: COMPATIBLE_TOOL_DEFS };
}

module.exports = {
  executeCompatibleTool,
  listCompatibleTools,
  COMPATIBLE_TOOL_DEFS,
};
