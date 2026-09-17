import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const TRACE_FILE = "db-chat-agent-traces.jsonl";
const MAX_JSON_CHARS = 4000;
const MAX_PREVIEW_CHARS = 2500;
const MAX_TRACE_FILE_BYTES = 8 * 1024 * 1024;

export function compactJson(value, max = MAX_JSON_CHARS) {
  if (value == null) return "";
  try {
    const text = JSON.stringify(value, null, 2);
    if (text.length <= max) return text;
    return `${text.slice(0, max)}\n…truncated`;
  } catch {
    const text = String(value);
    return text.length <= max ? text : `${text.slice(0, max)}\n…truncated`;
  }
}

export function summarizeMongoResult(structured, text) {
  const payload = structured && typeof structured === "object" ? structured : {};
  const documents = Array.isArray(payload.documents) ? payload.documents : null;
  return {
    count:
      payload.count ??
      payload.queryResultsCount ??
      payload.totalCount ??
      (documents ? documents.length : null),
    preview: String(text || compactJson(payload) || "No data returned.").slice(
      0,
      MAX_PREVIEW_CHARS
    ),
  };
}

export function createAgentTrace(question) {
  return {
    id: randomUUID(),
    startedAt: new Date().toISOString(),
    question: String(question || "").slice(0, 2000),
    planner: null,
    cycles: [],
    outcome: null,
    finishedAt: null,
  };
}

export function persistAgentTrace(trace) {
  try {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, TRACE_FILE);
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      if (size > MAX_TRACE_FILE_BYTES) {
        const backup = path.join(dir, `db-chat-agent-traces-${Date.now()}.jsonl.bak`);
        fs.renameSync(filePath, backup);
      }
    }
    fs.appendFileSync(filePath, `${JSON.stringify(trace)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to persist DB chat agent trace:", error.message || error);
  }
}

export function publicTrace(trace) {
  if (!trace) return null;
  return {
    id: trace.id,
    startedAt: trace.startedAt,
    finishedAt: trace.finishedAt,
    question: trace.question,
    planner: trace.planner,
    cycles: trace.cycles,
    outcome: trace.outcome,
  };
}
