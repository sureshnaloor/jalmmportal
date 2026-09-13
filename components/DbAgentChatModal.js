import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiCpu,
  FiDatabase,
  FiEye,
  FiList,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { DocumentGallery, RichAssistantText } from "./DbChatResults";

const AGENT_EXAMPLE_PROMPTS = [
  "Group open purchase orders by vendor and sum pending-val-sar",
  "Join vendors to purchaseorders and list vendors with the highest PO value",
  "Count materials by material-group",
];

const PIPELINE_STAGES = [
  { id: "plan", label: "Plan" },
  { id: "schema", label: "Schema" },
  { id: "query", label: "Query" },
  { id: "review", label: "Review" },
];

function parseSseBuffer(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() || "";
  for (const chunk of parts) {
    const lines = chunk.split("\n");
    let event = "message";
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    try {
      onEvent(event, JSON.parse(dataLines.join("\n")));
    } catch {
      onEvent(event, { raw: dataLines.join("\n") });
    }
  }
  return rest;
}

function stageIcon(stage) {
  if (stage === "plan") return <FiList />;
  if (stage === "schema") return <FiSearch />;
  if (stage === "query") return <FiDatabase />;
  if (stage === "review") return <FiEye />;
  return <FiCheck />;
}

function PipelineSteps({ current, plan, compact }) {
  const currentIndex = PIPELINE_STAGES.findIndex((item) => item.id === current);
  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div className="flex flex-wrap items-center gap-1.5">
        {PIPELINE_STAGES.map((item, index) => {
          const active = item.id === current;
          const done = currentIndex > index || current === "done";
          return (
            <span
              key={item.id}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                active
                  ? "bg-violet-600 text-white"
                  : done
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                    : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {done && !active ? <FiCheck /> : stageIcon(item.id)}
              {item.label}
            </span>
          );
        })}
      </div>
      {plan?.collections?.length > 0 && (
        <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
          {plan.collections.join(" · ")}
          {plan.needsJoin ? " · join" : ""}
          {plan.needsGrouping ? " · group" : ""}
        </p>
      )}
    </div>
  );
}

export default function DbAgentChatModal({ open, onClose, sessionName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [pipelineStage, setPipelineStage] = useState("");
  const [livePlan, setLivePlan] = useState(null);
  const [liveTools, setLiveTools] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape" && !sending) onClose();
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose, sending]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages, status, sending, pipelineStage, liveTools]);

  if (!open) return null;

  const sendPrompt = async (promptText) => {
    const prompt = (promptText || input).trim();
    if (!prompt || sending) return;

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setStatus("Planning the query…");
    setPipelineStage("plan");
    setLivePlan(null);
    setLiveTools([]);

    const assistant = {
      role: "assistant",
      content: "",
      toolsUsed: [],
      documents: null,
      error: null,
      plan: null,
      pipeline: [],
      reviewed: false,
    };

    try {
      const res = await fetch("/api/db-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: nextMessages, mode: "agent" }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming response was not available");

      const decoder = new TextDecoder();
      let buffer = "";
      let donePayload = null;
      const handleEvent = (event, payload) => {
        if (payload?.stage) setPipelineStage(payload.stage);
        if (event === "status") setStatus(payload.message || "");
        if (event === "plan" && payload.plan) {
          setLivePlan(payload.plan);
          assistant.plan = payload.plan;
        }
        if (event === "tool") {
          assistant.toolsUsed = [
            ...assistant.toolsUsed,
            {
              name: payload.name,
              collection: payload.collection,
            },
          ];
          setLiveTools(assistant.toolsUsed);
          setStatus(
            payload.collection
              ? `Querying ${payload.name} on ${payload.collection}…`
              : `Querying with ${payload.name}…`
          );
        }
        if (event === "review") {
          setStatus(
            payload.approved
              ? "Reviewer approved the answer…"
              : "Reviewer requested another query…"
          );
        }
        if (event === "done") donePayload = payload;
        if (event === "error") {
          throw new Error(payload.error || "Query failed");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseBuffer(buffer, handleEvent);
      }

      if (buffer.trim()) {
        parseSseBuffer(`${buffer}\n\n`, handleEvent);
      }

      if (!donePayload) {
        throw new Error("The chat did not return a complete answer");
      }

      assistant.content = donePayload.reply || "";
      assistant.toolsUsed = donePayload.toolsUsed || assistant.toolsUsed;
      assistant.documents = donePayload.documents || null;
      assistant.plan = donePayload.plan || assistant.plan;
      assistant.pipeline = donePayload.pipeline || [];
      assistant.reviewed = Boolean(donePayload.reviewed);
      setMessages([...nextMessages, assistant]);
    } catch (error) {
      assistant.error = error.message || "Failed to fetch from MongoDB";
      assistant.content =
        assistant.content ||
        "I could not complete that agent fetch. Try a narrower grouping or join question.";
      setMessages([...nextMessages, assistant]);
    } finally {
      setSending(false);
      setStatus("");
      setPipelineStage("");
      setLivePlan(null);
      setLiveTools([]);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/50 p-3 backdrop-blur-sm md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-chat-title"
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
      >
        <header className="flex items-start justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50 px-5 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-900">
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <FiCpu />
              Agent chat
            </div>
            <h2
              id="agent-chat-title"
              className="text-xl font-extrabold text-gray-900 dark:text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Plan, query, and review
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {sessionName ? `${sessionName} · ` : ""}
              This mode plans collections, runs aggregations and joins, then a
              reviewer checks the evidence before showing an answer.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-slate-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
              onClick={() => {
                setMessages([]);
                setStatus("");
                setPipelineStage("");
                setLivePlan(null);
                setLiveTools([]);
              }}
            >
              <FiTrash2 />
              Clear
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              onClick={onClose}
              disabled={sending}
            >
              <FiX />
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/60 p-5">
              <div className="flex items-center gap-2 font-semibold text-violet-900">
                <FiZap />
                Try an agent prompt
              </div>
              <p className="mt-1 text-sm text-violet-800">
                Use this when you need grouping, totals, or joins across
                collections. Simple lookups can stay on the main Database Chat.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AGENT_EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full bg-white px-3 py-1.5 text-left text-sm text-violet-900 shadow-sm ring-1 ring-violet-100 hover:bg-violet-100"
                    onClick={() => sendPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const hasDocs =
              Array.isArray(message.documents) && message.documents.length > 0;
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`w-full rounded-2xl px-4 py-4 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "max-w-[80%] bg-gradient-to-r from-violet-600 to-sky-600 text-white"
                      : "max-w-full bg-gradient-to-br from-white via-violet-50 to-sky-50 ring-1 ring-violet-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100 dark:ring-gray-700"
                  }`}
                >
                  {!isUser && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        <FiCpu />
                        Agent
                      </div>
                      {message.reviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                          <FiCheck />
                          Reviewed
                        </span>
                      ) : message.content && !message.error ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-100">
                          <FiEye />
                          Not approved
                        </span>
                      ) : null}
                    </div>
                  )}
                  {!isUser && (message.plan || message.pipeline?.length > 0) && (
                    <PipelineSteps
                      current={message.reviewed ? "done" : "review"}
                      plan={message.plan}
                      compact
                    />
                  )}
                  {isUser ? (
                    <p>{message.content}</p>
                  ) : message.content ? (
                    <RichAssistantText
                      text={message.content}
                      hideTables={hasDocs && message.reviewed}
                    />
                  ) : null}
                  {!isUser && message.toolsUsed?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {message.toolsUsed.map((tool, toolIndex) => (
                        <span
                          key={`${tool.name}-${toolIndex}`}
                          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-800 shadow-sm ring-1 ring-violet-100 dark:bg-gray-900 dark:text-sky-200"
                        >
                          {tool.name}
                          {tool.collection ? ` · ${tool.collection}` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  {!isUser && hasDocs && message.reviewed && (
                    <DocumentGallery documents={message.documents} />
                  )}
                  {message.error && (
                    <p className="mt-2 text-xs text-rose-600">{message.error}</p>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm text-violet-900">
              <div className="flex items-center gap-2">
                <FiRefreshCw className="animate-spin" />
                {status || "Working…"}
              </div>
              <PipelineSteps current={pipelineStage || "plan"} plan={livePlan} />
              {liveTools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {liveTools.map((tool, toolIndex) => (
                    <span
                      key={`${tool.name}-${toolIndex}`}
                      className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-800 shadow-sm ring-1 ring-violet-100"
                    >
                      {tool.name}
                      {tool.collection ? ` · ${tool.collection}` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendPrompt(input);
          }}
          className="border-t border-slate-100 p-4 dark:border-gray-800"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendPrompt(input);
                }
              }}
              rows={2}
              placeholder="Ask to group, join, or aggregate across collections…"
              className="min-h-[56px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-inner outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              <FiSend />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
