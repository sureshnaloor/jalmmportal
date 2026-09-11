import { OpenAI } from "openai";
import {
  ALLOWED_MCP_TOOLS,
  BLOCKED_COLLECTIONS,
  MAX_AGENT_ITERATIONS,
  MAX_TOOL_RESULT_CHARS,
  getAppDatabaseName,
} from "./constants";
import { callMongoMcpTool, getMongoMcpClient } from "./mongodbMcpClient";

function getOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured (OPENAI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY)."
    );
  }
  return new OpenAI({ apiKey });
}

function buildSystemPrompt() {
  const dbName = getAppDatabaseName();
  return `You are the MM Portal database assistant. Users ask questions in natural language. You fetch answers from MongoDB using read-only MCP tools.

Rules:
- FETCH ONLY. Never insert, update, delete, create, drop, rename, or export.
- Query only the "${dbName}" database.
- Do not query users, accounts, sessions, or other credential collections.
- If a field name is unknown, call collection-schema first.
- Prefer find or count for simple lookups. Use aggregate only when grouping, summing, or joining is required.
- Keep results small: default limit 10, never more than 50.
- Many field names in this app use hyphens, not camelCase.

Useful collections and fields:
- purchaseorders: po-number, po-date, delivery-date, vendorcode, vendorname, plant-code, pending-qty, pending-val-sar, po-value-sar, material.matcode
- vendors: vendor-name, vendor-code
- materials: material-description, material-type, material-group, unit-measure, updated-date
- projects, openrequisitions, poschedule, pocomments, po_feedback
- vendorevaluation, vendorsandtheirpo, vendorgroupmap
- materialgroups, materialsubgroups, materialdocuments
- dailymeetings, lessons_learnt, stockwithmatgroup

When you have enough data, write a short colorful summary in prose (1-3 sentences). Do NOT output markdown tables or ASCII tables — the user interface already renders the fetched documents as rich HTML cards. Mention the collection name in backticks. If nothing matches, say so and suggest a better filter.`;
}

function toOpenAiTools(mcpTools) {
  return (mcpTools || [])
    .filter((tool) => ALLOWED_MCP_TOOLS.has(tool.name))
    .map((tool) => {
      const schema =
        tool.inputSchema && typeof tool.inputSchema === "object"
          ? { ...tool.inputSchema }
          : { type: "object", properties: {} };
      delete schema.$schema;
      const properties = { ...(schema.properties || {}) };
      delete properties.connectionId;
      const required = Array.isArray(schema.required)
        ? schema.required.filter((name) => name !== "connectionId")
        : [];
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description || `MongoDB MCP tool ${tool.name}`,
          parameters: {
            type: "object",
            properties,
            required,
            additionalProperties: true,
          },
        },
      };
    });
}

function parseToolArguments(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function truncate(text) {
  if (!text) return "";
  if (text.length <= MAX_TOOL_RESULT_CHARS) return text;
  return `${text.slice(0, MAX_TOOL_RESULT_CHARS)}\n…truncated`;
}

function tryParseDocuments(text) {
  if (!text) return null;
  const trimmed = text.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end <= start) {
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const obj = JSON.parse(trimmed);
        return Array.isArray(obj.documents) ? obj.documents : [obj];
      } catch {
        return null;
      }
    }
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function runDbChat({ messages, onEvent }) {
  const emit = typeof onEvent === "function" ? onEvent : () => {};
  const openai = getOpenAI();
  const mcp = await getMongoMcpClient();
  emit({ type: "status", message: "Connected to MongoDB MCP (read-only)" });

  const { tools: mcpTools } = await mcp.listTools();
  const tools = toOpenAiTools(mcpTools);
  if (!tools.length) {
    throw new Error("MongoDB MCP did not expose any read tools.");
  }

  const openaiMessages = [
    { role: "system", content: buildSystemPrompt() },
    ...messages
      .filter(
        (msg) =>
          msg &&
          (msg.role === "user" || msg.role === "assistant") &&
          typeof msg.content === "string" &&
          msg.content.trim()
      )
      .slice(-12)
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      })),
  ];

  const toolsUsed = [];
  let lastDocuments = null;
  let reply = "";

  for (let i = 0; i < MAX_AGENT_ITERATIONS; i += 1) {
    emit({
      type: "status",
      message:
        i === 0
          ? "Understanding your question…"
          : "Reading results from MongoDB…",
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: openaiMessages,
      tools,
      tool_choice: "auto",
    });

    const choice = completion.choices?.[0];
    const assistantMessage = choice?.message;
    if (!assistantMessage) {
      throw new Error("The language model returned an empty response.");
    }

    openaiMessages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls || [];
    if (!toolCalls.length) {
      reply = (assistantMessage.content || "").trim();
      break;
    }

    for (const toolCall of toolCalls) {
      const name = toolCall.function?.name;
      const args = parseToolArguments(toolCall.function?.arguments);
      emit({
        type: "tool",
        name,
        collection: args.collection || null,
        database: args.database || getAppDatabaseName(),
      });

      let content = "";
      try {
        const used = await callMongoMcpTool(name, args);
        content = truncate(used.text || "No data returned.");
        const structuredDocs = used.structured?.documents;
        const docs = Array.isArray(structuredDocs)
          ? structuredDocs
          : tryParseDocuments(used.text);
        if (docs) lastDocuments = docs;
        toolsUsed.push({
          name,
          collection: used.args?.collection || args.collection || null,
          database: used.args?.database || args.database || getAppDatabaseName(),
        });
      } catch (error) {
        content = `Error: ${error.message || String(error)}`;
        toolsUsed.push({
          name,
          collection: args.collection || null,
          error: error.message || String(error),
        });
      }

      openaiMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content,
      });
    }
  }

  if (!reply) {
    reply =
      "I reached the fetch limit for this question. Try a narrower prompt, for example a specific collection, vendor, or PO number.";
  }

  return {
    reply,
    toolsUsed,
    documents: Array.isArray(lastDocuments) ? lastDocuments.slice(0, 50) : null,
  };
}

function parseCollectionNames(text) {
  if (!text) return [];
  const names = new Set();
  try {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed)
      ? parsed
      : parsed?.collections || parsed?.data || [];
    if (Array.isArray(list)) {
      for (const item of list) {
        if (typeof item === "string") names.add(item);
        else if (item?.name) names.add(String(item.name));
      }
    }
  } catch {
    const matches = text.match(/"name"\s*:\s*"([^"]+)"/g) || [];
    matches.forEach((match) => {
      const name = match.replace(/^"name"\s*:\s*"/, "").replace(/"$/, "");
      if (name) names.add(name);
    });
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export async function listReadableCollections() {
  const used = await callMongoMcpTool("list-collections", {
    database: getAppDatabaseName(),
  });
  const collections = parseCollectionNames(used.text).filter(
    (name) => !BLOCKED_COLLECTIONS.has(name.toLowerCase())
  );
  return {
    database: getAppDatabaseName(),
    collections,
  };
}
