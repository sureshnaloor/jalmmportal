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
import { buildTrainingPrompt, applyTrainingHints } from "./agentTraining";
import {
  compactJson,
  createAgentTrace,
  persistAgentTrace,
  publicTrace,
  summarizeMongoResult,
} from "./agentTrace";
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

const DATA_QUERY_TOOLS = new Set(["find", "aggregate", "aggregate-db", "count"]);

const MUST_QUERY_NUDGE =
  "You have not queried MongoDB yet for THIS question. Prior chat replies are not evidence. Call find, aggregate, or count now. Do not conclude zero/empty results from conversation history or training notes.";

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

function utcTodayIso() {
  return new Date().toISOString().slice(0, 10);
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

function groupedLookupDroppedKey(pipeline) {
  if (!Array.isArray(pipeline)) return null;
  let groupedFields = null;
  for (const stage of pipeline) {
    if (!stage || typeof stage !== "object") continue;
    if (stage.$group && typeof stage.$group === "object") {
      groupedFields = new Set(["_id", ...Object.keys(stage.$group)]);
      continue;
    }
    const lookup = stage.$lookup;
    if (
      groupedFields &&
      lookup &&
      lookup.localField &&
      lookup.localField !== "_id" &&
      !groupedFields.has(lookup.localField)
    ) {
      return String(lookup.localField);
    }
  }
  return null;
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

  const needsGrouping = Boolean(
    (raw?.needsGrouping != null ? raw.needsGrouping : false) ||
      questionLooksLikeGrouping(question)
  );
  const needsJoin = Boolean(
    (raw?.needsJoin != null ? raw.needsJoin : false) ||
      questionLooksLikeJoin(question)
  );

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

function buildPlannerPrompt(dbName, liveCollections, trainingText) {
  return `You are the planning stage of the MM Portal database assistant.
Return ONLY JSON (no markdown) describing how to fetch the answer from MongoDB.

Database: "${dbName}"
Live collections: ${liveCollections.join(", ") || "(none listed)"}

${trainingText ? `${trainingText}\n\n` : ""}${buildCatalogPrompt()}

Rules:
- FETCH ONLY. Never write, export, or touch users/sessions/accounts.
- Human training above is the source of truth for collection names and join/link fields when it applies to THIS question's year and collections.
- Follow-ups ("now link vendors", "line item details") still need a fresh query. Do not reuse a previous empty answer.
- The year named in the user question is authoritative. Do not copy another lesson's date range.
- purchaseorders is line-level. Totals, "how many POs", vendor rankings, or open-PO lists MUST set needsGrouping=true and groupBy po-number (and vendorcode when grouping by vendor).
- Relating vendors, materials, schedules, comments, evaluations, or projects to POs MUST set needsJoin=true and list joinKeys from the join map or human training. Phrases like "link to vendors" or "vendor details" are joins.
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
  "queryStrategy": "aggregate $match then $group",
  "reasoning": "why these collections, grouping, and joins were chosen"
}`;
}

function buildExecutorPrompt(dbName, plan, schemaText, retryNotes) {
  const retryBlock = retryNotes
    ? `\nRETRY INSTRUCTIONS FROM REVIEWER (must follow):\n${retryNotes}\n`
    : "";
  const today = utcTodayIso();
  return `You are the query stage of the MM Portal database assistant.
Execute the approved plan with read-only MongoDB tools, then write a short answer from the tool evidence only.

Database: "${dbName}"
Today (UTC): ${today}
Plan JSON:
${JSON.stringify(plan, null, 2)}

${schemaText}
${retryBlock}
Rules:
- FETCH ONLY. Query only "${dbName}". Never invent numbers, names, or counts.
- Human training in the context above is mandatory for collection names, join keys, and group-by fields when it matches THIS question.
- You MUST call find, aggregate, or count before answering. Do not answer from memory or from prior chat.
- Prior conversation replies are NOT MongoDB evidence. A previous turn that found nothing (or listed other years) does not answer this question. Query again.
- The year in THIS user question is authoritative. Do not copy 2026 (or any other) date ranges from training onto a different year.
- Never conclude zero/empty POs unless a tool on this turn returned empty documents.
- If needsGrouping is true: you MUST use aggregate with $group. Never total from a find sample.
- If needsJoin is true: you MUST use aggregate with $lookup (simple form: from, localField, foreignField, as). Do not run two separate finds and "mentally join".
- purchaseorders: $group by po-number for PO-level answers. Sum po-value-sar / pending-val-sar.
- po-date is a BSON Date. For JSON tools, filter with $expr + $toDate. A bare ISO string is wrong and matches zero rows because Date vs string makes $lte always false. Example for calendar year 2025:
  { "$match": { "$expr": { "$and": [
    { "$gte": ["$po-date", { "$toDate": "2025-01-01T00:00:00.000Z" }] },
    { "$lte": ["$po-date", { "$toDate": "2025-12-31T23:59:59.999Z" }] }
  ] } } }
  For "year YYYY till now", use YYYY-01-01 through ${today}. Do not invert $gte/$lte years.
- Top-N POs plus vendor/line-item details:
  1. $match the year
  2. $group by po-number: {
       _id: "$po-number",
       totalValue: { $sum: "$po-value-sar" },
       vendorcode: { $first: "$vendorcode" },
       lineItems: { $push: { "po-line-item": "$po-line-item", "po-value-sar": "$po-value-sar", "matcode": "$material.matcode" } }
     }
  3. $sort totalValue desc, $limit N
  4. $lookup vendors only: localField vendorcode, foreignField vendor-code
  Do NOT $lookup purchaseorders again. That self-join ignores $limit, reloads every line as a full PO document, and the result looks like more than N purchase orders. Do NOT $unwind vendor or line arrays.
- MongoDB is 4.2: use simple $lookup only. Put $limit after $group/$sort, never before $lookup or $group.
- If a field is missing from the schema, call collection-schema, then query.
- For "how many documents", use count. For listings, find/aggregate with limit up to 50.
- After tools return, write 1-3 sentences in prose. Do NOT output markdown tables — the UI renders documents. Mention collection names in backticks.
- If tools return nothing, say so. Never pad with guessed rows.`;
}

function buildReviewerPrompt(trainingText) {
  return `You are the reviewer stage of the MM Portal database assistant.
Decide whether the draft answer is fully supported by the MongoDB tool evidence.

${trainingText ? `${trainingText}\n\n` : ""}Approve only if ALL are true:
- Every number, name, and count in the draft appears in the tool evidence (or is a trivial restatement of it).
- If the plan required grouping, an aggregate $group actually ran. Reject totals inferred from a small find.
- If the plan required a join, an aggregate $lookup actually ran across the planned collections, using the trained join keys when a human lesson applies.
- The query covered the planned collections; it did not answer from one collection when two were required.
- The draft does not invent field names, vendors, POs, or empty-result excuses that contradict the evidence.
- Reject any draft that claims zero/no results unless THIS turn's tool evidence shows an executed find/aggregate/count that returned empty. Prior chat is not evidence.
- Empty documents after $group then $lookup then $unwind is usually a pipeline bug (lookup key dropped by $group), not an empty year. Reject "no POs exist" and retry: keep vendorcode with $first in $group, $lookup without $unwind.

Do NOT reject for these (they are not errors):
- The same vendor code/name on several rows. That is normal: one vendor can have many purchase orders.
- Distinct po-numbers that happen to share the same total value or vendor. Duplicate means the SAME po-number appears more than once.
- The draft omitting a narration of "$group / aggregation steps" when the tool evidence already shows $group by po-number.
- Extra supported fields (vendor name, line items) beyond what the user asked.

If $group by po-number already ran and the listed PO numbers are unique, APPROVE.

If you approve, you may lightly edit the draft for clarity, still using only evidence.
If you reject, explain what query should run next and which collections/fields the human should confirm.

Return ONLY JSON:
{
  "approved": false,
  "reasoning": "short explanation of why this draft is approved or rejected",
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

  const usedData = (toolsUsed || []).filter((tool) => DATA_QUERY_TOOLS.has(tool.name));
  if (!usedData.length) {
    issues.push(
      "No MongoDB data query was executed. Answering from chat history or training is not allowed."
    );
  }
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
  for (const tool of usedAgg) {
    const dropped = groupedLookupDroppedKey(tool.pipeline);
    if (dropped) {
      issues.push(
        `$lookup localField "${dropped}" is not kept in $group. Keep it with $first, and do not $unwind empty vendor arrays.`
      );
    }
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

async function planQuery({ openai, question, history, liveCollections, dbName, trainingText }) {
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildPlannerPrompt(dbName, liveCollections, trainingText) },
      ...history.slice(-8),
      {
        role: "user",
        content: `Create the fetch plan for this question:\n${question}`,
      },
    ],
  });
  const parsed = extractJson(completion.choices?.[0]?.message?.content || "");
  return {
    plan: normalizePlan(parsed || {}, question, liveCollections),
    raw: parsed || {},
    reasoning: String(parsed?.reasoning || parsed?.intent || "").trim(),
  };
}

async function fetchPlannedSchemas(plan, dbName, trainingText) {
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
    trainingText,
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
  const querySteps = [];
  let lastDocuments = null;
  let reply = "";
  const executorNotes = [];

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
    const thinking = (assistantMessage.content || "").trim();
    if (thinking) {
      executorNotes.push(thinking);
    }
    if (!toolCalls.length) {
      if (toolsUsed.length === 0 && i < MAX_AGENT_ITERATIONS - 1) {
        openaiMessages.push({
          role: "user",
          content: MUST_QUERY_NUDGE,
        });
        continue;
      }
      reply = thinking;
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
      let executedArgs = args;
      let resultSummary = { count: null, preview: "" };
      try {
        const used = await callMongoMcpTool(name, args);
        executedArgs = used.args || args;
        content = truncate(used.text || "No data returned.");
        resultSummary = summarizeMongoResult(used.structured, used.text);
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
        resultSummary = { count: null, preview: content };
        toolsUsed.push({
          name,
          collection: args.collection || null,
          error: error.message || String(error),
          pipeline: Array.isArray(args.pipeline) ? args.pipeline : null,
        });
      }

      const queryStep = {
        tool: name,
        collection: executedArgs?.collection || args.collection || null,
        llmTask: thinking || `Call ${name}`,
        requested: compactJson(args),
        executed: compactJson(executedArgs),
        resultCount: resultSummary.count,
        resultPreview: resultSummary.preview,
        error: content.startsWith("Error:") ? content : null,
      };
      querySteps.push(queryStep);
      emit({
        type: "trace",
        stage: "query",
        step: {
          kind: "mongo",
          ...queryStep,
        },
      });

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
    querySteps,
    executorNotes,
  };
}

function compactEvidence(evidence) {
  const packed = JSON.stringify(evidence || [], null, 2);
  return truncate(packed, MAX_REVIEW_EVIDENCE_CHARS);
}

function extractPoNumbersFromText(text) {
  const source = String(text || "");
  const labeled = [];
  const labeledRe = /(?:PO Number|po-number|_id)\s*[:*]+\s*([0-9]{6,12})/gi;
  let match;
  while ((match = labeledRe.exec(source))) labeled.push(match[1]);
  if (labeled.length) return labeled;
  return [...new Set(source.match(/\b(?:45|46|61|31)\d{8}\b/g) || [])];
}

function poNumbersAreUnique(numbers) {
  if (!numbers.length) return null;
  return new Set(numbers).size === numbers.length;
}

function isSpuriousReviewerIssue(text, uniquePos) {
  const t = String(text || "");
  if (
    uniquePos &&
    /non-unique|duplicate/i.test(t) &&
    /po|purchase order|vendor/i.test(t)
  ) {
    return true;
  }
  if (/does not mention the need for aggregation/i.test(t)) return true;
  if (/does not specify if the aggregation was performed/i.test(t)) return true;
  if (/does not confirm that the query was executed/i.test(t)) return true;
  if (/same vendor/i.test(t) && /unique|duplicate/i.test(t)) return true;
  return false;
}

async function reviewAnswer({ openai, question, plan, draft, evidence, quality, trainingText }) {
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildReviewerPrompt(trainingText) },
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
  const uniquePos = poNumbersAreUnique(extractPoNumbersFromText(draft));
  const rawIssues = Array.isArray(parsed.issues) ? parsed.issues.map(String) : [];
  const llmIssues = rawIssues.filter((issue) => !isSpuriousReviewerIssue(issue, uniquePos));
  const spuriousOnly =
    quality.length === 0 &&
    llmIssues.length === 0 &&
    (rawIssues.length > 0 ||
      /non-unique|duplicate/i.test(String(parsed.reasoning || "")));
  const approved =
    quality.length === 0 &&
    llmIssues.length === 0 &&
    (Boolean(parsed.approved) || spuriousOnly);
  return {
    approved,
    reasoning: spuriousOnly && !parsed.approved
      ? "Approved: listed PO numbers are unique. The same vendor on different POs is not a duplicate."
      : String(parsed.reasoning || "").trim(),
    raw: parsed,
    issues: [...quality, ...llmIssues].filter(Boolean),
    missingCollections: Array.isArray(parsed.missingCollections)
      ? parsed.missingCollections.map(String)
      : [],
    shouldRetry: approved ? false : parsed.shouldRetry !== false,
    retryInstructions: approved ? "" : String(parsed.retryInstructions || "").trim(),
    finalReply: String(parsed.finalReply || "").trim() || (approved ? String(draft || "").trim() : ""),
    qualityIssues: quality,
    blockedByQualityGate: quality.length > 0,
    llmApproved: Boolean(parsed.approved),
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
  lines.push(
    "Use the Teach the agent form below: name the real collections, the fields to join or group by, and any notes. That training is saved and reused on the next prompt."
  );
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
- You MUST call find, aggregate, or count before answering. Prior chat replies are not evidence. Never conclude zero/empty results without a query on this turn.
- The year in the current question is authoritative. po-date is a BSON Date; filter with $expr + $toDate, e.g. 2025-01-01 through 2025-12-31. Do not copy 2026 dates from earlier turns.
- Join vendors with $lookup: purchaseorders.vendorcode = vendors.vendor-code. For top-N POs plus line items: $group by po-number keeping vendorcode with $first and $push of po-line-item / po-value-sar, then $lookup vendors only. Do not $lookup purchaseorders again and do not $unwind empty arrays.

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

    const forceTools = toolsUsed.length === 0 && i < 3;
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        temperature: 0.1,
        messages: openaiMessages,
        tools,
        tool_choice: forceTools ? "required" : "auto",
      });
    } catch (error) {
      if (!forceTools) throw error;
      completion = await openai.chat.completions.create({
        model: CHAT_MODEL,
        temperature: 0.1,
        messages: openaiMessages,
        tools,
        tool_choice: "auto",
      });
    }

    const assistantMessage = completion.choices?.[0]?.message;
    if (!assistantMessage) {
      throw new Error("The language model returned an empty response.");
    }

    openaiMessages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls || [];
    if (!toolCalls.length) {
      if (toolsUsed.length === 0 && i < SIMPLE_MAX_ITERATIONS - 1) {
        openaiMessages.push({
          role: "user",
          content: MUST_QUERY_NUDGE,
        });
        continue;
      }
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
  const trainingText = buildTrainingPrompt(question);
  const trace = createAgentTrace(question);

  emit({
    type: "status",
    stage: "plan",
    message: "Planning collections, grouping, and joins…",
  });
  let plan;
  let plannerRaw = {};
  let plannerReasoning = "";
  try {
    const planned = await planQuery({
      openai,
      question,
      history,
      liveCollections,
      dbName,
      trainingText,
    });
    plan = planned.plan;
    plannerRaw = planned.raw;
    plannerReasoning = planned.reasoning;
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
    plannerReasoning = `Planner fallback after error: ${error.message || "planning failed"}`;
    emit({
      type: "status",
      stage: "plan",
      message: plannerReasoning,
    });
  }
  plan = applyTrainingHints(plan, question);
  trace.planner = {
    reasoning: plannerReasoning,
    raw: plannerRaw,
    plan,
    trainingUsed: Boolean(trainingText),
  };
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
    type: "trace",
    stage: "plan",
    step: {
      kind: "plan",
      reasoning: plannerReasoning,
      plan,
    },
  });

  emit({
    type: "status",
    stage: "schema",
    message: plan.collections.length
      ? `Loading schemas for ${plan.collections.join(", ")}…`
      : "Loading collection context…",
  });
  const schemaText = await fetchPlannedSchemas(plan, dbName, trainingText);

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
      trainingText,
    });
    const cycleTrace = {
      cycle: cycle + 1,
      executorNotes: execution.executorNotes || [],
      queries: execution.querySteps || [],
      draftReply: execution.reply,
      qualityIssues: quality,
      review: {
        approved: review.approved,
        llmApproved: review.llmApproved,
        blockedByQualityGate: review.blockedByQualityGate,
        reasoning: review.reasoning,
        issues: review.issues,
        missingCollections: review.missingCollections,
        retryInstructions: review.retryInstructions,
      },
    };
    trace.cycles.push(cycleTrace);
    emit({
      type: "review",
      stage: "review",
      approved: review.approved,
      issues: review.issues,
    });
    emit({
      type: "trace",
      stage: "review",
      step: {
        kind: "review",
        ...cycleTrace.review,
        draftReply: execution.reply,
      },
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

  const rejectedBy = review?.approved
    ? null
    : review?.blockedByQualityGate
      ? "quality-gate"
      : "reviewer";
  trace.outcome = {
    reviewed: Boolean(review?.approved),
    rejectedBy,
  };
  trace.finishedAt = new Date().toISOString();
  persistAgentTrace(trace);
  const traceView = publicTrace(trace);

  if (!review?.approved) {
    return {
      reply: validationFailedReply(review),
      toolsUsed: execution?.toolsUsed || [],
      documents: execution?.documents || null,
      reviewed: false,
      needsTraining: true,
      question,
      reviewIssues: review?.issues || [],
      missingCollections: review?.missingCollections || [],
      plan,
      pipeline,
      trace: traceView,
    };
  }

  return {
    reply: review.finalReply || execution.reply,
    toolsUsed: execution.toolsUsed,
    documents: execution.documents,
    reviewed: true,
    plan,
    pipeline,
    trace: traceView,
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
