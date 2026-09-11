export const PRECONFIGURED_CONNECTION_ID = "preconfigured";

export const ALLOWED_MCP_TOOLS = new Set([
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

export const WRITE_MCP_TOOLS = [
  "insert-many",
  "update-many",
  "delete-many",
  "create-collection",
  "create-index",
  "drop-collection",
  "drop-database",
  "drop-index",
  "rename-collection",
  "atlas-local-create-deployment",
  "atlas-local-delete-deployment",
  "export",
];

export const BLOCKED_COLLECTIONS = new Set([
  "users",
  "accounts",
  "sessions",
  "verificationtokens",
  "verification_tokens",
]);

export const BLOCKED_DATABASES = new Set(["admin", "local", "config"]);

export const WRITE_AGGREGATE_STAGES = new Set(["$out", "$merge"]);

export const MAX_FIND_LIMIT = 50;
export const MAX_TOOL_RESULT_CHARS = 40000;
export const MAX_AGENT_ITERATIONS = 8;

export function getAppDatabaseName() {
  return process.env.DB_NAME || "mmportal";
}
