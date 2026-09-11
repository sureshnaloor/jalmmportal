import {
  ALLOWED_MCP_TOOLS,
  BLOCKED_COLLECTIONS,
  BLOCKED_DATABASES,
  MAX_FIND_LIMIT,
  WRITE_AGGREGATE_STAGES,
  getAppDatabaseName,
} from "./constants";

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
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
    const hasLimit = pipeline.some(
      (stage) => stage && typeof stage === "object" && "$limit" in stage
    );
    if (!hasLimit) {
      args.pipeline = [...pipeline, { $limit: MAX_FIND_LIMIT }];
    }
  }

  return args;
}
