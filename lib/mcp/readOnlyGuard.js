import {
  ALLOWED_MCP_TOOLS,
  BLOCKED_COLLECTIONS,
  BLOCKED_DATABASES,
  MAX_AGGREGATE_LIMIT,
  MAX_FIND_LIMIT,
  WRITE_AGGREGATE_STAGES,
  getAppDatabaseName,
} from "./constants";

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

export function normalizeAggregatePipeline(pipeline, maxLimit = MAX_AGGREGATE_LIMIT) {
  const cleaned = [];
  let lastLimit = maxLimit;
  for (const stage of pipeline || []) {
    if (stage && typeof stage === "object" && !Array.isArray(stage) && "$limit" in stage) {
      const n = Number(stage.$limit);
      lastLimit = Number.isFinite(n)
        ? Math.min(Math.max(1, n), maxLimit)
        : maxLimit;
      continue;
    }
    cleaned.push(stage);
  }
  cleaned.push({ $limit: lastLimit });
  return cleaned;
}

export function assertReadOnlyToolCall(name, rawArgs = {}) {
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
