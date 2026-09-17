import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const JSON_FILE = "db-chat-agent-training.json";
const MD_FILE = "db-chat-agent-training.md";
const MAX_LESSONS_IN_PROMPT = 40;
const MAX_NOTES_CHARS = 4000;
const MAX_TRAINING_PROMPT_CHARS = 14000;

function dataDir() {
  return path.join(process.cwd(), "data");
}

function jsonPath() {
  return path.join(dataDir(), JSON_FILE);
}

function mdPath() {
  return path.join(dataDir(), MD_FILE);
}

function emptyStore() {
  return { version: 1, updatedAt: null, lessons: [] };
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseJoinLine(line) {
  const text = String(line || "").trim();
  if (!text) return null;
  const match = text.match(
    /^([A-Za-z0-9_]+)\.([A-Za-z0-9_.-]+)\s*(?:=|->|↔|to)\s*([A-Za-z0-9_]+)\.([A-Za-z0-9_.-]+)$/i
  );
  if (!match) return null;
  return {
    from: match[1],
    localField: match[2],
    to: match[3],
    foreignField: match[4],
  };
}

function parseJoins(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item && item.from && item.to && item.localField && item.foreignField) {
          return {
            from: String(item.from).trim(),
            localField: String(item.localField).trim(),
            to: String(item.to).trim(),
            foreignField: String(item.foreignField).trim(),
          };
        }
        return parseJoinLine(item);
      })
      .filter(Boolean);
  }
  return String(value || "")
    .split(/\n/)
    .map(parseJoinLine)
    .filter(Boolean);
}

export function loadTrainingStore() {
  try {
    const raw = fs.readFileSync(jsonPath(), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyStore();
    return {
      version: 1,
      updatedAt: parsed.updatedAt || null,
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
    };
  } catch {
    return emptyStore();
  }
}

function renderMarkdown(store) {
  const lessons = store.lessons || [];
  const lines = [
    "# DB Chat Agent Training",
    "",
    "Human corrections collected when the reviewer rejects an Agent Chat answer.",
    "The agent reads `data/db-chat-agent-training.json` on every prompt. This markdown file is regenerated on each save.",
    "",
    `Lessons: ${lessons.length}`,
    store.updatedAt ? `Updated: ${store.updatedAt}` : "",
    "",
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "");

  if (!lessons.length) {
    lines.push("No lessons yet.");
    return `${lines.join("\n")}\n`;
  }

  lessons
    .slice()
    .reverse()
    .forEach((lesson, index) => {
      lines.push(`## ${lessons.length - index}. ${lesson.question || "Untitled question"}`);
      lines.push("");
      if (lesson.createdAt) lines.push(`- When: ${lesson.createdAt}`);
      if (lesson.createdBy) lines.push(`- By: ${lesson.createdBy}`);
      if (lesson.collections?.length) {
        lines.push(`- Collections: ${lesson.collections.join(", ")}`);
      }
      if (lesson.groupBy?.length) {
        lines.push(`- Group by: ${lesson.groupBy.join(", ")}`);
      }
      if (lesson.joins?.length) {
        lines.push("- Joins:");
        lesson.joins.forEach((join) => {
          lines.push(
            `  - ${join.from}.${join.localField} = ${join.to}.${join.foreignField}`
          );
        });
      }
      if (lesson.fields) lines.push(`- Fields: ${lesson.fields}`);
      if (lesson.notes) {
        lines.push("- Notes:");
        lines.push("");
        lines.push(lesson.notes);
      }
      if (lesson.reviewerIssues?.length) {
        lines.push(`- Reviewer issues: ${lesson.reviewerIssues.join("; ")}`);
      }
      lines.push("");
    });

  return `${lines.join("\n").trim()}\n`;
}

function writeStore(store) {
  fs.mkdirSync(dataDir(), { recursive: true });
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  fs.writeFileSync(jsonPath(), payload, "utf8");
  fs.writeFileSync(mdPath(), renderMarkdown(store), "utf8");
}

export function saveTrainingLesson(input, { createdBy } = {}) {
  const collections = asList(input.collections);
  const joins = parseJoins(input.joins);
  const groupBy = asList(input.groupBy);
  const fields = String(input.fields || "").trim().slice(0, MAX_NOTES_CHARS);
  const notes = String(input.notes || "").trim().slice(0, MAX_NOTES_CHARS);
  const question = String(input.question || "").trim().slice(0, 2000);

  if (!question) {
    throw new Error("The original question is required to save training.");
  }
  if (!collections.length && !joins.length && !groupBy.length && !fields && !notes) {
    throw new Error(
      "Add at least one collection, join, group-by field, or note before saving."
    );
  }

  const store = loadTrainingStore();
  const lesson = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    createdBy: createdBy || null,
    question,
    collections,
    joins,
    groupBy,
    fields,
    notes,
    reviewerIssues: asList(input.reviewerIssues).slice(0, 12),
    plan: input.plan && typeof input.plan === "object" ? {
      collections: asList(input.plan.collections),
      needsJoin: Boolean(input.plan.needsJoin),
      needsGrouping: Boolean(input.plan.needsGrouping),
      groupBy: asList(input.plan.groupBy),
      queryStrategy: String(input.plan.queryStrategy || "").slice(0, 500),
    } : null,
  };

  store.lessons.push(lesson);
  store.updatedAt = lesson.createdAt;
  writeStore(store);
  return { lesson, count: store.lessons.length };
}

function yearsInText(text) {
  return new Set(String(text || "").match(/\b20\d{2}\b/g) || []);
}

function yearsConflict(question, lessonQuestion) {
  const qYears = yearsInText(question);
  const lYears = yearsInText(lessonQuestion);
  if (!qYears.size || !lYears.size) return false;
  for (const year of qYears) {
    if (lYears.has(year)) return false;
  }
  return true;
}

function scoreLesson(question, lesson) {
  const q = String(question || "").toLowerCase();
  if (!q) return 0;
  if (yearsConflict(question, lesson.question)) return 0;
  let score = 0;
  const taught = String(lesson.question || "").toLowerCase();
  if (taught && (q.includes(taught.slice(0, 40)) || taught.includes(q.slice(0, 40)))) {
    score += 5;
  }
  (lesson.collections || []).forEach((name) => {
    if (q.includes(String(name).toLowerCase())) score += 2;
  });
  return score;
}

export function applyTrainingHints(plan, question) {
  const store = loadTrainingStore();
  const lessons = store.lessons || [];
  if (!lessons.length || !plan) return plan;

  const ranked = lessons
    .map((lesson) => ({ lesson, score: scoreLesson(question, lesson) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.score < 4) return plan;

  const lesson = best.lesson;
  const collections = [...(plan.collections || [])];
  for (const name of lesson.collections || []) {
    if (name && !collections.includes(name)) collections.push(name);
  }

  const trainedJoins = (lesson.joins || []).map((join) => ({
    from: join.from,
    local: join.localField,
    to: join.to,
    foreign: join.foreignField,
  }));

  const needsJoin = Boolean(plan.needsJoin || trainedJoins.length);
  const needsGrouping = Boolean(plan.needsGrouping || (lesson.groupBy || []).length);

  return {
    ...plan,
    collections: collections.slice(0, 6),
    needsJoin,
    needsGrouping,
    groupBy: plan.groupBy?.length ? plan.groupBy : lesson.groupBy || [],
    joinKeys: plan.joinKeys?.length ? plan.joinKeys : trainedJoins,
    mustUseAggregate: Boolean(needsGrouping || needsJoin || plan.mustUseAggregate),
  };
}

export function buildTrainingPrompt(question) {
  const store = loadTrainingStore();
  const lessons = store.lessons || [];
  if (!lessons.length) return "";

  const ranked = [...lessons]
    .map((lesson) => ({ lesson, score: scoreLesson(question, lesson) }))
    .sort((a, b) => b.score - a.score || String(b.lesson.createdAt).localeCompare(String(a.lesson.createdAt)));

  const selected = ranked
    .filter((item) => item.score > 0)
    .slice(0, MAX_LESSONS_IN_PROMPT)
    .map((item) => item.lesson);

  if (!selected.length) {
    ranked
      .filter((item) => !yearsConflict(question, item.lesson.question))
      .slice(0, 8)
      .forEach((item) => selected.push(item.lesson));
  }

  const blocks = selected.map((lesson, index) => {
    const joinLines = (lesson.joins || [])
      .map((join) => `${join.from}.${join.localField} = ${join.to}.${join.foreignField}`)
      .join("; ");
    return [
      `Lesson ${index + 1} (human-taught):`,
      `Question: ${lesson.question}`,
      lesson.collections?.length ? `Collections: ${lesson.collections.join(", ")}` : "",
      joinLines ? `Joins / link fields: ${joinLines}` : "",
      lesson.groupBy?.length ? `Group by: ${lesson.groupBy.join(", ")}` : "",
      lesson.fields ? `Fields: ${lesson.fields}` : "",
      lesson.notes ? `Notes: ${lesson.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const header = [
    "HUMAN TRAINING (must follow for collection names and join/group-by fields when the lesson matches THIS question):",
    "These lessons were written by users after the reviewer rejected an answer. Prefer this over the static catalog when they conflict.",
    "Date ranges, ISODate examples, and empty/NIL notes apply ONLY to that lesson's question year. Do not copy 2026 dates or empty-result conclusions onto a 2025 (or other year) question. Empty results in training were caused by bad date filters, not by an empty collection.",
    "A follow-up that asks to link vendors or show line items still requires a fresh MongoDB query, even if a prior lesson said no join was needed.",
    "The same vendor on several different PO numbers is not a duplicate. Non-unique POs means the same po-number listed twice (line-item grain without $group). If $group by po-number already ran, approve vendor repeats.",
  ].join("\n");

  const text = `${header}\n\n${blocks.join("\n\n")}`;
  if (text.length <= MAX_TRAINING_PROMPT_CHARS) return text;
  return `${text.slice(0, MAX_TRAINING_PROMPT_CHARS)}\n…truncated older training`;
}

export function trainingSummary() {
  const store = loadTrainingStore();
  return {
    count: store.lessons.length,
    updatedAt: store.updatedAt,
    lessons: store.lessons.slice(-20).reverse().map((lesson) => ({
      id: lesson.id,
      createdAt: lesson.createdAt,
      question: lesson.question,
      collections: lesson.collections,
      joins: lesson.joins,
    })),
  };
}
