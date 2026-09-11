import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import {
  FiSend,
  FiDatabase,
  FiRefreshCw,
  FiShield,
  FiMessageSquare,
  FiTrash2,
  FiZap,
} from "react-icons/fi";
import HeaderComponent from "../../components/HeaderNewComponent";
import FooterComponent from "../../components/FooterComponent";
import {
  DocumentGallery,
  RichAssistantText,
} from "../../components/DbChatResults";

const EXAMPLE_PROMPTS = [
  "List the collections in this database",
  "How many documents are in purchaseorders?",
  "Show 5 recent purchase orders with PO number, vendor, and value",
  "Find vendors whose name contains electric",
  "Count materials whose description contains gasket",
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

export default function DbChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [collections, setCollections] = useState([]);
  const [database, setDatabase] = useState("");
  const [collectionsError, setCollectionsError] = useState("");
  const [loadingCollections, setLoadingCollections] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, sending]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/db-chat", { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load collections");
        if (!cancelled) {
          setCollections(Array.isArray(json.collections) ? json.collections : []);
          setDatabase(json.database || "");
        }
      } catch (error) {
        if (!cancelled) {
          setCollectionsError(error.message || "MongoDB MCP is not available yet");
        }
      } finally {
        if (!cancelled) setLoadingCollections(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const collectionPreview = useMemo(
    () => collections.slice(0, 18),
    [collections]
  );

  const sendPrompt = async (promptText) => {
    const prompt = (promptText || input).trim();
    if (!prompt || sending) return;

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setStatus("Connecting to MongoDB MCP…");

    const assistant = {
      role: "assistant",
      content: "",
      toolsUsed: [],
      documents: null,
      error: null,
    };

    try {
      const res = await fetch("/api/db-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: nextMessages }),
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
        if (event === "status") setStatus(payload.message || "");
        if (event === "tool") {
          assistant.toolsUsed = [
            ...assistant.toolsUsed,
            {
              name: payload.name,
              collection: payload.collection,
            },
          ];
          setMessages([...nextMessages, { ...assistant }]);
          setStatus(
            payload.collection
              ? `Fetching ${payload.name} on ${payload.collection}…`
              : `Fetching with ${payload.name}…`
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
      setMessages([...nextMessages, assistant]);
    } catch (error) {
      assistant.error = error.message || "Failed to fetch from MongoDB";
      assistant.content =
        assistant.content ||
        "I could not complete that fetch. Check that MongoDB MCP is running and try a simpler question.";
      setMessages([...nextMessages, assistant]);
    } finally {
      setSending(false);
      setStatus("");
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Head>
        <title>Database Chat | JAL MM Portal</title>
      </Head>
      <HeaderComponent />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[280px_1fr] md:px-6">
        <aside className="h-fit rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-200">
            <FiDatabase />
            <h2 className="font-bold">Read-only MCP</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ask questions in plain English. The chat uses the MongoDB Community
            MCP server to fetch from{" "}
            <span className="font-semibold text-sky-800">
              {database || "the app database"}
            </span>
            . Writes are blocked.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <FiShield />
            Fetch only
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Collections
          </h3>
          {loadingCollections && (
            <p className="mt-2 text-sm text-gray-500">Loading via MCP…</p>
          )}
          {collectionsError && (
            <p className="mt-2 text-sm text-rose-600">{collectionsError}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {collectionPreview.map((name) => (
              <button
                key={name}
                type="button"
                className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100"
                onClick={() =>
                  sendPrompt(`What is stored in the ${name} collection? Show 3 sample documents.`)
                }
              >
                {name}
              </button>
            ))}
          </div>
          {collections.length > collectionPreview.length && (
            <p className="mt-2 text-xs text-gray-500">
              +{collections.length - collectionPreview.length} more
            </p>
          )}
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-gray-800">
            <div>
              <h1
                className="text-xl font-extrabold text-gray-900 dark:text-white md:text-2xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Database Chat
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Signed in as {session?.user?.name || session?.user?.email}. Prompts
                are translated to MongoDB find / aggregate / count through MCP.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
              onClick={() => {
                setMessages([]);
                setStatus("");
              }}
            >
              <FiTrash2 />
              Clear
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-5">
                <div className="flex items-center gap-2 font-semibold text-sky-900">
                  <FiZap />
                  Try a prompt
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="rounded-full bg-white px-3 py-1.5 text-left text-sm text-sky-900 shadow-sm ring-1 ring-sky-100 hover:bg-sky-100"
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
                        ? "max-w-[80%] bg-gradient-to-r from-sky-600 to-cyan-600 text-white"
                        : "max-w-full bg-gradient-to-br from-white via-sky-50 to-teal-50 ring-1 ring-sky-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100 dark:ring-gray-700"
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-600 to-teal-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                        <FiMessageSquare />
                        Assistant
                      </div>
                    )}
                    {isUser ? (
                      <p>{message.content}</p>
                    ) : (
                      <RichAssistantText
                        text={message.content}
                        hideTables={hasDocs}
                      />
                    )}
                    {!isUser && message.toolsUsed?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {message.toolsUsed.map((tool, toolIndex) => (
                          <span
                            key={`${tool.name}-${toolIndex}`}
                            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-800 shadow-sm ring-1 ring-teal-100 dark:bg-gray-900 dark:text-sky-200"
                          >
                            {tool.name}
                            {tool.collection ? ` · ${tool.collection}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isUser && hasDocs && (
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
              <div className="flex items-center gap-2 text-sm text-sky-800">
                <FiRefreshCw className="animate-spin" />
                {status || "Fetching…"}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
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
                placeholder="Ask to fetch vendors, POs, materials, counts…"
                className="min-h-[56px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-inner outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                <FiSend />
                Send
              </button>
            </div>
          </form>
        </section>
      </main>

      <FooterComponent />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return { props: { session } };
}
