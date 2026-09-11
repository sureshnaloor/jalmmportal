/**
 * Read-only MongoDB MCP server compatible with MongoDB 4.2 (wire version 8).
 *
 * The official mongodb-mcp-server uses driver 7, which requires MongoDB 4.4+.
 * This portal's database is 4.2, so Cursor and the in-app chat use the same
 * mongodb@4.x driver as the rest of the Next.js app.
 *
 * Usage (from repo root):
 *   node scripts/mongodb-mcp-stdio.js
 */

const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

function log(message) {
  console.error(`[mongodb-mcp] ${message}`);
}

async function checkConnectivity(uri) {
  const { MongoClient } = require("mongodb");
  const {
    executeCompatibleTool,
  } = require("../lib/mcp/compatibleMongoTools");
  const dbName = process.env.DB_NAME || process.env.MDB_MCP_DB || "mmportal";
  log(`check: env loaded (uri length ${uri.length}, db=${dbName})`);
  log("check: connecting to MongoDB (8s timeout)…");
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    log("check: ping ok");
  } finally {
    await client.close().catch(() => {});
  }
  const listed = await executeCompatibleTool("list-collections", {
    database: dbName,
  });
  const count = listed.structured?.totalCount ?? 0;
  log(`check: list-collections ok (${count} collections)`);
  log(
    "check: passed — stdio mode is supposed to keep running; do not use it as a one-shot process"
  );
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MDB_MCP_CONNECTION_STRING || process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MongoDB MCP: set MONGODB_URI (or MDB_MCP_CONNECTION_STRING) in .env.local"
    );
    process.exit(1);
  }

  const checkMode = process.argv.includes("--check");
  if (checkMode) {
    await checkConnectivity(uri);
    return;
  }

  log(
    "stdio MCP server listening on stdin/stdout — this looks idle until a client sends JSON-RPC. Use --check to test MongoDB and exit."
  );

  const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
  const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
  const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
  } = require("@modelcontextprotocol/sdk/types.js");
  const {
    executeCompatibleTool,
    COMPATIBLE_TOOL_DEFS,
  } = require("../lib/mcp/compatibleMongoTools");

  const server = new Server(
    { name: "mmportal-mongodb-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: COMPATIBLE_TOOL_DEFS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const used = await executeCompatibleTool(
        request.params.name,
        request.params.arguments || {}
      );
      return {
        content: [{ type: "text", text: used.text }],
        structuredContent: used.structured,
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error.message || String(error),
          },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
