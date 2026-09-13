import { OpenAI } from "openai";
import {
  ALLOWED_MCP_TOOLS,
  BLOCKED_COLLECTIONS,
  CHAT_MODEL,
  MAX_AGENT_ITERATIONS,
  MAX_REVIEW_CYCLES,
  MAX_TOOL_RESULT_CHARS,
  getAppDatabaseName,
} from "./constants";
import {
  buildCatalogPrompt,
  guessCollectionsFromQuestion,
  questionLooksLikeGrouping,
  questionLooksLikeJoin,
} from "./collectionCatalog";
import { callMongoMcpTool, getMongoMcpClient } from "./mongodbMcpClient";

const MAX_PLAN_COLLECTIONS = 6;
const MAX_REVIEW_EVIDENCE_CHARS = 18000;

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

function conversationMessages(messages, limit = 12) {
  return (messages || [])
    .filter(
      (msg) =>
        msg &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string" &&
        msg.content.trim()
    )
    .slice(-limit)
    .map((msg) => ({
      role: msg.role,
      content: msg.content.trim(),
    }));
}

function lastUserQuestion(messages) {
  const history = conversationMessages(messages, 20);
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].role === "user") return history[i].content;
  }
  return "";
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

function truncate(text, max = MAX_TOOL_RESULT_CHARS) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…truncated`;
}

function extractJson(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
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

function pipelineHasStage(pipeline, stageName) {
  if (!Array.isArray(pipeline)) return false;
  return pipeline.some(
    (stage) => stage && typeof stage === "object" && stageName in stage
  );
}

function normalizePlan(raw, question, liveCollections) {
  const live = new Set(liveCollections || []);
  const guessed = guessCollectionsFromQuestion(question);
  const fromModel = Array.isArray(raw?.collections)
    ? raw.collections.map((name) => String(name || "").trim()).filter(Boolean)
    : [];
  const merged = [];
  for (const name of [...fromModel, ...guessed]) {
    if (live.size && !live.has(name)) continue;
    if (!merged.includes(name)) merged.push(name);
    if (merged.length >= MAX_PLAN_COLLECTIONS) break;
  }

  const needsGrouping =
    raw?.needsGrouping != null
      ? Boolean(raw.needsGrouping)
      : questionLooksLikeGrouping(question);
  const needsJoin =
    raw?.needsJoin != null
      ? Boolean(raw.needsJoin)
      : questionLooksLikeJoin(question);

  const joinKeys = Array.isArray(raw?.joinKeys)
    ? raw.joinKeys.filter((item) => item && item.from && item.to)
    : [];
  const groupBy = Array.isArray(raw?.groupBy)
    ? raw.groupBy.map(String).filter(Boolean)
    : needsGrouping && merged.includes("purchaseorders")
      ? ["po-number"]
      : [];

  return {
    intent: String(raw?.intent || question || "").trim(),
    needsGrouping,
    needsJoin,
    collections: merged,
    joinKeys,
    groupBy,
    metrics: Array.isArray(raw?.metrics) ? raw.metrics.map(String) : [],
    filters: String(raw?.filters || "").trim(),
    queryStrategy: String(
      raw?.queryStrategy ||
        (needsJoin || needsGrouping
          ? "aggregate with $lookup and/or $group"
          : "count or find")
    ).trim(),
    mustUseAggregate: Boolean(needsGrouping || needsJoin),
  };
}

function buildPlannerPrompt(dbName, liveCollections) {
  return `You are the planning stage of the MM Portal database assistant.
Return ONLY JSON (no markdown) describing how to fetch the answer from MongoDB.

Database: "${dbName}"
Live collections: ${liveCollections.join(", ") || "(none listed)"}

${buildCatalogPrompt()}

Rules:
- FETCH ONLY. Never write, export, or touch users/sessions/accounts.
- purchaseorders is line-level. Totals, "how many POs", vendor rankings, or open-PO lists MUST set needsGrouping=true and groupBy po-number (and vendorcode when grouping by vendor).
- Relating vendors, materials, schedules, comments, evaluations, or projects to POs MUST set needsJoin=true and list joinKeys from the join map.
- Prefer aggregate over find whenever grouping, summing, counting groups, or joining.
- Use count for a single collection document total. Do not estimate totals from a small find sample.
- Pick every collection needed; do not stop at the first obvious one.
- Field names often use hyphens. Never invent camelCase variants.

JSON shape:
{
  "intent": "short restatement",
  "needsGrouping": true,
  "needsJoin": false,
  "collections": ["purchaseorders"],
  "joinKeys": [{"from":"vendors","local":"vendor-code","to":"purchaseorders","foreign":"vendorcode"}],
  "groupBy": ["po-number"],
  "metrics": ["sum pending-val-sar"],
  "filters": "pending-val-sar > 0",
  "queryStrategy": "aggregate $match then $group"
}`;
}

function buildExecutorPrompt(dbName, plan, schemaText, retryNotes) {
  const retryBlock = retryNotes
    ? `\nRETRY INSTRUCTIONS FROM REVIEWER (must follow):\n${retryNotes}\n`
    : "";
  return `You are the query stage of the MM Portal database assistant.
Execute the approved plan with read-only MongoDB tools, then write a short answer from the tool evidence only.

Database: "${dbName}"
Plan JSON:
${JSON.stringify(plan, null, 2)}

${schemaText}
${retryBlock}
Rules:
- FETCH ONLY. Query only "${dbName}". Never invent numbers, names, or counts.
- You MUST call tools before answering. Do not answer from memory.
- If needsGrouping is true: you MUST use aggregate with $group. Never total from a find sample.
- If needsJoin is true: you MUST use aggregate with $lookup (simple form: from, localField, foreignField, as). Do not run two separate finds and "mentally join".
- purchaseorders: $group by po-number for PO-level answers. Sum po-value-sar / pending-val-sar.
- MongoDB is 4.2: use simple $lookup only. Put $limit after $group/$sort, never before $lookup or $group.
- If a field is missing from the schema, call collection-schema, then query.
- For "how many documents", use count. For listings, find/aggregate with limit up to 50.
- After tools return, write 1-3 sentences in prose. Do NOT output markdown tables — the UI renders documents. Mention collection names in backticks.
- If tools return nothing, say so. Never pad with guessed rows.`;
}

function buildReviewerPrompt() {
  return `You are the reviewer stage of the MM Portal database assistant.
Decide whether the draft answer is fully supported by the MongoDB tool evidence.

Approve only if ALL are true:
- Every number, name, and count in the draft appears in the tool evidence (or is a trivial restatement of it).
- If the plan required grouping, an aggregate $group actually ran. Reject totals inferred from a small find.
- If the plan required a join, an aggregate $lookup actually ran across the planned collections.
- The query covered the planned collections; it did not answer from one collection when two were required.
- The draft does not invent field names, vendors, POs, or empty-result excuses that contradict the evidence.

If you approve, you may lightly edit the draft for clarity, still using only evidence.
If you reject, explain what query should run next.

Return ONLY JSON:
{
  "approved": false,
  "issues": ["..."],
  "missingCollections": ["..."],
  "shouldRetry": true,
  "retryInstructions": "concrete MongoDB steps to run",
  "finalReply": "user-facing reply if approved, else empty"
}`;
}

function qualityIssues(plan, toolsUsed) {
  const issues = [];
  const usedAgg = (toolsUsed || []).filter(
    (tool) => tool.name === "aggregate" || tool.name === "aggregate-db"
  );
  const queried = new Set(
    (toolsUsed || [])
      .map((tool) => tool.collection)
      .filter(Boolean)
  );

  if (plan.mustUseAggregate && !usedAgg.length) {
    issues.push(
      "Plan required grouping or a join, but no aggregate pipeline was executed."
    );
  }
  if (plan.needsGrouping && !usedAgg.some((tool) => pipelineHasStage(tool.pipeline, "$group"))) {
    issues.push("Plan required grouping, but no $group stage was used.");
  }
  if (plan.needsJoin && !usedAgg.some((tool) => pipelineHasStage(tool.pipeline, "$lookup"))) {
    issues.push("Plan required a join, but no $lookup stage was used.");
  }
  if (plan.needsJoin && plan.collections.length > 1) {
    const missing = plan.collections.filter((name) => !queried.has(name));
    const joined = usedAgg.some((tool) => pipelineHasStage(tool.pipeline, "$lookup"));
    if (missing.length && !joined) {
      issues.push(
        `Planned collections were not queried: ${missing.join(", ")}.`
      );
    }
  }
  return issues;
}

async function planQuery({ openai, question, history, liveCollections, dbName }) {
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildPlannerPrompt(dbName, liveCollections) },
      ...history.slice(-8),
      {
        role: "user",
        content: `Create the fetch plan for this question:\n${question}`,
      },
    ],
  });
  const parsed = extractJson(completion.choices?.[0]?.message?.content || "");
  return normalizePlan(parsed || {}, question, liveCollections);
}

async function fetchPlannedSchemas(plan, dbName) {
  const chunks = [];
  for (const collection of plan.collections.slice(0, MAX_PLAN_COLLECTIONS)) {
    try {
      const used = await callMongoMcpTool("collection-schema", {
        database: dbName,
        collection,
        sampleSize: 25,
      });
      chunks.push(
        `Live schema for ${collection}:\n${truncate(used.text || "", 4000)}`
      );
    } catch (error) {
      chunks.push(
        `Live schema for ${collection}: unavailable (${error.message || error}).`
      );
    }
  }
  return [
    buildCatalogPrompt(plan.collections),
    chunks.join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function executePlan({
  openai,
  tools,
  plan,
  schemaText,
  history,
  retryNotes,
  onEvent,
  dbName,
}) {
  const emit = typeof onEvent === "function" ? onEvent : () => {};
  const openaiMessages = [
    {
      role: "system",
      content: buildExecutorPrompt(dbName, plan, schemaText, retryNotes),
    },
    ...history,
  ];

  const toolsUsed = [];
  const evidence = [];
  let lastDocuments = null;
  let reply = "";

  for (let i = 0; i < MAX_AGENT_ITERATIONS; i += 1) {
    emit({
      type: "status",
      stage: "query",
      message:
        i === 0
          ? "Running planned MongoDB queries…"
          : "Reading MongoDB results…",
    });

    const forceTools = toolsUsed.length === 0 && i < 3;
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        temperature: 0,
        messages: openaiMessages,
        tools,
        tool_choice: forceTools ? "required" : "auto",
      });
    } catch (error) {
      if (!forceTools) throw error;
      completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        temperature: 0,
        messages: openaiMessages,
        tools,
        tool_choice: "auto",
      });
    }

    const assistantMessage = completion.choices?.[0]?.message;
    if (!assistantMessage) {
      throw new Error("The language model returned an empty query response.");
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
        stage: "query",
        name,
        collection: args.collection || null,
        database: args.database || dbName,
      });

      let content = "";
      try {
        const used = await callMongoMcpTool(name, args);
        content = truncate(used.text || "No data returned.");
        const structuredDocs = used.structured?.documents;
        const docs = Array.isArray(structuredDocs)
          ? structuredDocs
          : tryParseDocuments(used.text);
        if (
          docs &&
          (name === "find" || name === "aggregate" || name === "aggregate-db")
        ) {
          lastDocuments = docs;
        }
        toolsUsed.push({
          name,
          collection: used.args?.collection || args.collection || null,
          database: used.args?.database || args.database || dbName,
          pipeline: Array.isArray(used.args?.pipeline)
            ? used.args.pipeline
            : Array.isArray(args.pipeline)
              ? args.pipeline
              : null,
        });
      } catch (error) {
        content = `Error: ${error.message || String(error)}`;
        toolsUsed.push({
          name,
          collection: args.collection || null,
          error: error.message || String(error),
          pipeline: Array.isArray(args.pipeline) ? args.pipeline : null,
        });
      }

      evidence.push({
        name,
        collection: args.collection || null,
        result: truncate(content, 6000),
      });
      openaiMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content,
      });
    }
  }

  if (!reply) {
    reply =
      "I reached the fetch limit for this question before a complete answer was ready.";
  }

  return {
    reply,
    toolsUsed,
    documents: Array.isArray(lastDocuments) ? lastDocuments.slice(0, 50) : null,
    evidence,
  };
}

function compactEvidence(evidence) {
  const packed = JSON.stringify(evidence || [], null, 2);
  return truncate(packed, MAX_REVIEW_EVIDENCE_CHARS);
}

async function reviewAnswer({ openai, question, plan, draft, evidence, quality }) {
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildReviewerPrompt() },
      {
        role: "user",
        content: [
          `Question:\n${question}`,
          `Plan:\n${JSON.stringify(plan, null, 2)}`,
          quality.length
            ? `Deterministic quality flags:\n${quality.map((item) => `- ${item}`).join("\n")}`
            : "Deterministic quality flags: none",
          `Draft answer (do not show to the user unless you approve):\n${draft}`,
          `Tool evidence:\n${compactEvidence(evidence)}`,
        ].join("\n\n"),
      },
    ],
  });

  const parsed = extractJson(completion.choices?.[0]?.message?.content || "") || {};
  const approved = Boolean(parsed.approved) && quality.length === 0;
  return {
    approved,
    issues: [
      ...quality,
      ...(Array.isArray(parsed.issues) ? parsed.issues.map(String) : []),
    ].filter(Boolean),
    missingCollections: Array.isArray(parsed.missingCollections)
      ? parsed.missingCollections.map(String)
      : [],
    shouldRetry: parsed.shouldRetry !== false,
    retryInstructions: String(parsed.retryInstructions || "").trim(),
    finalReply: String(parsed.finalReply || "").trim(),
  };
}

function validationFailedReply(review) {
  const issues = (review?.issues || []).slice(0, 6);
  const missing = review?.missingCollections || [];
  const lines = [
    "I could not validate a complete answer from the database, so no result is shown.",
  ];
  if (issues.length) {
    lines.push(`Reviewer issues: ${issues.join(" ")}`);
  }
  if (missing.length) {
    lines.push(`Collections still needed: ${missing.map((name) => `\`${name}\``).join(", ")}.`);
  }
  lines.push("Try a more specific prompt (collection, vendor code, or PO number), or add schema notes in the collection catalog.");
  return lines.join(" ");
}

function buildSimpleSystemPrompt() {
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

const SIMPLE_MAX_ITERATIONS = 8;

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
    { role: "system", content: buildSimpleSystemPrompt() },
    ...conversationMessages(messages, 12),
  ];

  const toolsUsed = [];
  let lastDocuments = null;
  let reply = "";

  for (let i = 0; i < SIMPLE_MAX_ITERATIONS; i += 1) {
    emit({
      type: "status",
      message:
        i === 0
          ? "Understanding your question…"
          : "Reading results from MongoDB…",
    });

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.1,
      messages: openaiMessages,
      tools,
      tool_choice: "auto",
    });

    const assistantMessage = completion.choices?.[0]?.message;
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

export async function runDbAgentChat({ messages, onEvent }) {
  const emit = typeof onEvent === "function" ? onEvent : () => {};
  const openai = getOpenAI();
  const mcp = await getMongoMcpClient();
  const dbName = getAppDatabaseName();
  emit({
    type: "status",
    stage: "plan",
    message: "Connected to MongoDB (read-only). Planning the query…",
  });

  const { tools: mcpTools } = await mcp.listTools();
  const tools = toOpenAiTools(mcpTools);
  if (!tools.length) {
    throw new Error("MongoDB MCP did not expose any read tools.");
  }

  const history = conversationMessages(messages);
  const question = lastUserQuestion(messages);
  const listed = await listReadableCollections();
  const liveCollections = listed.collections || [];

  emit({
    type: "status",
    stage: "plan",
    message: "Planning collections, grouping, and joins…",
  });
  let plan;
  try {
    plan = await planQuery({
      openai,
      question,
      history,
      liveCollections,
      dbName,
    });
  } catch (error) {
    plan = normalizePlan(
      {
        intent: question,
        collections: guessCollectionsFromQuestion(question),
        queryStrategy: "inspect schema then fetch",
      },
      question,
      liveCollections
    );
    emit({
      type: "status",
      stage: "plan",
      message: `Planner fallback after error: ${error.message || "planning failed"}`,
    });
  }
  emit({
    type: "plan",
    stage: "plan",
    plan: {
      intent: plan.intent,
      collections: plan.collections,
      needsGrouping: plan.needsGrouping,
      needsJoin: plan.needsJoin,
      groupBy: plan.groupBy,
      queryStrategy: plan.queryStrategy,
    },
  });

  emit({
    type: "status",
    stage: "schema",
    message: plan.collections.length
      ? `Loading schemas for ${plan.collections.join(", ")}…`
      : "Loading collection context…",
  });
  const schemaText = await fetchPlannedSchemas(plan, dbName);

  let execution = null;
  let review = null;
  let retryNotes = "";

  for (let cycle = 0; cycle < MAX_REVIEW_CYCLES; cycle += 1) {
    if (cycle > 0) {
      emit({
        type: "status",
        stage: "query",
        message: "Reviewer requested another query. Re-running…",
      });
    }
    execution = await executePlan({
      openai,
      tools,
      plan,
      schemaText,
      history,
      retryNotes,
      onEvent: emit,
      dbName,
    });

    const quality = qualityIssues(plan, execution.toolsUsed);
    emit({
      type: "status",
      stage: "review",
      message: "Reviewing the answer against MongoDB evidence…",
    });
    review = await reviewAnswer({
      openai,
      question,
      plan,
      draft: execution.reply,
      evidence: execution.evidence,
      quality,
    });
    emit({
      type: "review",
      stage: "review",
      approved: review.approved,
      issues: review.issues,
    });

    if (review.approved) break;
    if (cycle === MAX_REVIEW_CYCLES - 1) break;
    if (!review.shouldRetry && quality.length === 0) break;
    retryNotes = [
      review.retryInstructions,
      review.issues.length ? `Issues: ${review.issues.join("; ")}` : "",
      review.missingCollections.length
        ? `Query these collections: ${review.missingCollections.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const pipeline = [
    {
      stage: "plan",
      summary: plan.collections.length
        ? `${plan.collections.join(", ")}${plan.needsJoin ? " · join" : ""}${
            plan.needsGrouping ? " · group" : ""
          }`
        : plan.intent,
    },
    {
      stage: "query",
      summary: `${(execution?.toolsUsed || []).length} tool call(s)`,
    },
    {
      stage: "review",
      summary: review?.approved ? "Approved" : "Rejected",
    },
  ];

  if (!review?.approved) {
    return {
      reply: validationFailedReply(review),
      toolsUsed: execution?.toolsUsed || [],
      documents: null,
      reviewed: false,
      plan,
      pipeline,
    };
  }

  return {
    reply: review.finalReply || execution.reply,
    toolsUsed: execution.toolsUsed,
    documents: execution.documents,
    reviewed: true,
    plan,
    pipeline,
  };
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
