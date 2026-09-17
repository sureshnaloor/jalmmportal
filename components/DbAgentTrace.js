import { useState } from "react";
import { FiActivity, FiChevronDown, FiChevronRight } from "react-icons/fi";

function CodeBlock({ text }) {
  if (!text) return <p className="text-[12px] text-slate-500">None</p>;
  return (
    <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950/95 p-2.5 text-[11px] leading-relaxed text-slate-100">
      {text}
    </pre>
  );
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 last:border-b-0 dark:border-gray-700">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-800 dark:text-slate-100"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <FiChevronDown /> : <FiChevronRight />}
        {title}
      </button>
      {open && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function DbAgentTrace({ trace }) {
  const [open, setOpen] = useState(true);
  if (!trace) return null;

  const failed = trace.outcome && !trace.outcome.reviewed;
  const planner = trace.planner || {};
  const cycles = Array.isArray(trace.cycles) ? trace.cycles : [];

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 dark:border-gray-700 dark:bg-gray-950 dark:text-slate-100">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 bg-slate-50 px-3 py-2 text-left text-[12px] font-bold uppercase tracking-wide text-slate-700 dark:bg-gray-900 dark:text-slate-200"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex items-center gap-1.5">
          <FiActivity />
          Agent trace
          {failed ? " · review rejected" : ""}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open && (
        <div>
          <Section title="1. LLM plan" defaultOpen>
            {planner.reasoning && (
              <p className="text-[12px] leading-relaxed">{planner.reasoning}</p>
            )}
            <CodeBlock
              text={JSON.stringify(
                {
                  intent: planner.plan?.intent,
                  collections: planner.plan?.collections,
                  needsGrouping: planner.plan?.needsGrouping,
                  needsJoin: planner.plan?.needsJoin,
                  groupBy: planner.plan?.groupBy,
                  joinKeys: planner.plan?.joinKeys,
                  queryStrategy: planner.plan?.queryStrategy,
                  trainingUsed: planner.trainingUsed,
                },
                null,
                2
              )}
            />
          </Section>

          {cycles.map((cycle) => (
            <div key={`cycle-${cycle.cycle}`}>
              <Section
                title={`2. Cycle ${cycle.cycle} · LLM query notes`}
                defaultOpen={failed}
              >
                {cycle.executorNotes?.length ? (
                  cycle.executorNotes.map((note, index) => (
                    <p key={index} className="text-[12px] leading-relaxed">
                      {note}
                    </p>
                  ))
                ) : (
                  <p className="text-[12px] text-slate-500">
                    The query model did not emit extra reasoning text (it called tools directly).
                  </p>
                )}
              </Section>

              <Section
                title={`3. Cycle ${cycle.cycle} · MCP / MongoDB queries`}
                defaultOpen
              >
                {!cycle.queries?.length && (
                  <p className="text-[12px] text-rose-600">No MongoDB tool was called.</p>
                )}
                {(cycle.queries || []).map((query, index) => (
                  <div
                    key={`${query.tool}-${index}`}
                    className="rounded-lg border border-slate-200 p-2 dark:border-gray-700"
                  >
                    <p className="text-[12px] font-semibold">
                      {query.tool}
                      {query.collection ? ` on ${query.collection}` : ""}
                      {query.resultCount != null ? ` · ${query.resultCount} row(s)` : ""}
                    </p>
                    {query.llmTask && (
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                        Task: {query.llmTask}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] font-semibold uppercase text-slate-500">
                      Query sent
                    </p>
                    <CodeBlock text={query.executed || query.requested} />
                    <p className="mt-2 text-[11px] font-semibold uppercase text-slate-500">
                      MongoDB result
                    </p>
                    {query.error ? (
                      <p className="text-[12px] text-rose-600">{query.error}</p>
                    ) : (
                      <CodeBlock text={query.resultPreview} />
                    )}
                  </div>
                ))}
              </Section>

              <Section title={`4. Cycle ${cycle.cycle} · Draft answer`} defaultOpen={failed}>
                <p className="text-[12px] leading-relaxed">
                  {cycle.draftReply || "No draft was produced."}
                </p>
              </Section>

              <Section title={`5. Cycle ${cycle.cycle} · Reviewer`} defaultOpen>
                <p className="text-[12px] font-semibold">
                  {cycle.review?.approved
                    ? "Approved"
                    : cycle.review?.blockedByQualityGate
                      ? "Rejected by quality gate (grouping/join rules)"
                      : "Rejected by reviewer LLM"}
                  {cycle.review?.llmApproved && cycle.review?.blockedByQualityGate
                    ? " — reviewer LLM had approved, but a required $group/$lookup was missing."
                    : ""}
                </p>
                {cycle.review?.reasoning && (
                  <p className="text-[12px] leading-relaxed">{cycle.review.reasoning}</p>
                )}
                {cycle.qualityIssues?.length > 0 && (
                  <ul className="list-disc pl-4 text-[12px] text-amber-800">
                    {cycle.qualityIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
                {cycle.review?.issues?.length > 0 && (
                  <ul className="list-disc pl-4 text-[12px]">
                    {cycle.review.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
                {cycle.review?.retryInstructions && (
                  <p className="text-[12px]">
                    Retry: {cycle.review.retryInstructions}
                  </p>
                )}
              </Section>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
