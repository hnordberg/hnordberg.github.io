"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  typesetMathInSubtree,
  useMathJax,
} from "../../../components/MathJax";
import { getAtPath, isMissing } from "./lib/jsonPath";
import type {
  AcceptedDecisionsFile,
  Decision,
  DecisionKind,
  JsonPatchOp,
  ReviewBundle,
  ReviewSeverity,
  TopicReviewEntry,
} from "./types";

type DecisionMap = Map<string, Map<number, Decision>>;

const PENDING: Decision = { kind: "pending" };
const ACCEPTED: Decision = { kind: "accepted" };
const REJECTED: Decision = { kind: "rejected" };

function patchKey(p: JsonPatchOp): string {
  return JSON.stringify([p.op, p.path, p.reason ?? null]);
}

function proposedValueFor(entry: TopicReviewEntry, patch: JsonPatchOp): unknown {
  if (patch.op === "remove") return undefined;
  if (patch.value !== undefined) return patch.value;
  return getAtPath(entry.proposed, patch.path);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function stringifyForEdit(value: unknown): string {
  if (typeof value === "string") return value;
  if (isMissing(value) || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function buildInitialDecisions(
  entries: TopicReviewEntry[],
  accepted: AcceptedDecisionsFile
): DecisionMap {
  const out: DecisionMap = new Map();
  const acceptedBySlug = new Map(
    accepted.topics.map((t) => [t.slug, t] as const)
  );
  for (const entry of entries) {
    const inner = new Map<number, Decision>();
    const stored = acceptedBySlug.get(entry.slug);
    const acceptedByKey = new Map<string, JsonPatchOp>();
    for (const p of stored?.acceptedPatches ?? []) {
      acceptedByKey.set(patchKey(p), p);
    }
    const rejectedKeys = new Set(
      (stored?.rejectedPatches ?? []).map(patchKey)
    );
    entry.jsonPatch.forEach((patch, i) => {
      const k = patchKey(patch);
      if (rejectedKeys.has(k)) {
        inner.set(i, REJECTED);
        return;
      }
      const accepted = acceptedByKey.get(k);
      if (accepted) {
        const proposed = proposedValueFor(entry, patch);
        if (
          accepted.value === undefined ||
          deepEqual(accepted.value, proposed)
        ) {
          inner.set(i, ACCEPTED);
        } else {
          inner.set(i, {
            kind: "edited",
            raw: stringifyForEdit(accepted.value),
          });
        }
        return;
      }
      inner.set(i, PENDING);
    });
    out.set(entry.slug, inner);
  }
  return out;
}

type SaveBuildResult =
  | { ok: true; file: AcceptedDecisionsFile }
  | { ok: false; error: string; slug: string; patchIndex: number };

function buildAcceptedFile(
  entries: TopicReviewEntry[],
  decisions: DecisionMap
): SaveBuildResult {
  const topics = [];
  for (const entry of entries) {
    const inner = decisions.get(entry.slug);
    const acceptedPatches: JsonPatchOp[] = [];
    const rejectedPatches: JsonPatchOp[] = [];
    for (let i = 0; i < entry.jsonPatch.length; i++) {
      const patch = entry.jsonPatch[i];
      const d = inner?.get(i) ?? PENDING;
      if (d.kind === "rejected") {
        rejectedPatches.push(patch);
        continue;
      }
      if (d.kind === "accepted") {
        const value = proposedValueFor(entry, patch);
        if (patch.op === "remove") {
          acceptedPatches.push({ ...patch });
        } else {
          acceptedPatches.push({ ...patch, value });
        }
        continue;
      }
      if (d.kind === "edited") {
        const proposed = proposedValueFor(entry, patch);
        let value: unknown;
        if (typeof proposed === "string" || isMissing(proposed) || proposed === undefined) {
          value = d.raw;
        } else {
          try {
            value = JSON.parse(d.raw);
          } catch (err) {
            return {
              ok: false,
              error: `JSON parse failed for ${entry.slug} patch #${i} (${patch.path}): ${(err as Error).message}`,
              slug: entry.slug,
              patchIndex: i,
            };
          }
        }
        acceptedPatches.push({ ...patch, value });
        continue;
      }
    }
    if (acceptedPatches.length || rejectedPatches.length) {
      topics.push({ slug: entry.slug, acceptedPatches, rejectedPatches });
    }
  }
  return {
    ok: true,
    file: {
      version: 1,
      updatedAt: new Date().toISOString(),
      topics,
    },
  };
}

function severityColor(s: ReviewSeverity): string {
  if (s === "reject") return "bg-red-600 text-white";
  if (s === "warn") return "bg-yellow-500 text-black";
  return "bg-zinc-500 text-white";
}

function buttonClass(active: boolean, kind: DecisionKind | "edited"): string {
  const base =
    "px-3 py-1 rounded text-sm font-medium border transition-colors";
  if (!active) return `${base} border-zinc-400 text-zinc-300 hover:bg-zinc-700`;
  if (kind === "accepted") return `${base} bg-green-600 border-green-600 text-white`;
  if (kind === "rejected") return `${base} bg-red-600 border-red-600 text-white`;
  if (kind === "edited") return `${base} bg-amber-600 border-amber-600 text-white`;
  return `${base} bg-zinc-500 border-zinc-500 text-white`;
}

function HtmlValue({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    typesetMathInSubtree(ref.current);
  }, [html]);
  return (
    <div
      ref={ref}
      className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const SECTION_KINDS = new Set([
  "prose",
  "definition",
  "theorem",
  "example",
  "pitfall",
  "equation",
  "figure",
]);

function isSectionLike(v: unknown): v is {
  kind?: string;
  title?: string;
  body?: string;
  equation?: string;
} {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.kind === "string" && SECTION_KINDS.has(o.kind)) return true;
  return (
    typeof o.body === "string" ||
    typeof o.equation === "string" ||
    typeof o.title === "string"
  );
}

function isCardLike(v: unknown): v is {
  noteId?: string;
  prompt?: string;
  answer?: string;
  tags?: string[];
} {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.prompt === "string" && typeof o.answer === "string";
}

function SectionPreview({
  value,
}: {
  value: {
    kind?: string;
    title?: string;
    body?: string;
    equation?: string;
  };
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        {value.kind && (
          <span className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-100 font-mono">
            {value.kind}
          </span>
        )}
        {value.title && (
          <span className="font-semibold text-zinc-200">{value.title}</span>
        )}
      </div>
      {value.equation && (
        <HtmlValue html={`$$${value.equation}$$`} />
      )}
      {value.body && <HtmlValue html={value.body} />}
    </div>
  );
}

function CardPreview({
  value,
}: {
  value: {
    prompt?: string;
    answer?: string;
    tags?: string[];
  };
}) {
  return (
    <div className="space-y-2">
      {value.prompt && (
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Prompt
          </div>
          <HtmlValue html={value.prompt} />
        </div>
      )}
      {value.answer && (
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Answer
          </div>
          <HtmlValue html={value.answer} />
        </div>
      )}
      {value.tags && value.tags.length > 0 && (
        <div className="text-xs text-zinc-500">tags: {value.tags.join(", ")}</div>
      )}
    </div>
  );
}

function ValueView({ value }: { value: unknown }) {
  if (isMissing(value)) {
    return <span className="italic text-zinc-500">(missing)</span>;
  }
  if (value === undefined) {
    return <span className="italic text-zinc-500">(undefined)</span>;
  }
  if (typeof value === "string") {
    return <HtmlValue html={value} />;
  }
  if (Array.isArray(value)) {
    if (value.every(isSectionLike) || value.every(isCardLike)) {
      return (
        <div className="space-y-3">
          {value.map((item, i) => (
            <div
              key={i}
              className="border border-zinc-800 rounded p-2 bg-zinc-950/30"
            >
              {isSectionLike(item) ? (
                <SectionPreview value={item} />
              ) : (
                <CardPreview value={item} />
              )}
            </div>
          ))}
        </div>
      );
    }
  }
  if (isSectionLike(value)) {
    return <SectionPreview value={value} />;
  }
  if (isCardLike(value)) {
    return <CardPreview value={value} />;
  }
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

type PatchCardProps = {
  index: number;
  patch: JsonPatchOp;
  entry: TopicReviewEntry;
  decision: Decision;
  onChange: (next: Decision) => void;
};

function PatchCard({ index, patch, entry, decision, onChange }: PatchCardProps) {
  const originalValue = useMemo(
    () => getAtPath(entry.original, patch.path),
    [entry, patch.path]
  );
  const proposedValue = useMemo(
    () => proposedValueFor(entry, patch),
    [entry, patch]
  );

  const onClickEdit = () => {
    if (decision.kind === "edited") return;
    onChange({ kind: "edited", raw: stringifyForEdit(proposedValue) });
  };

  return (
    <div
      id={`patch-${index}`}
      className="border border-zinc-700 rounded-lg p-4 mb-3 bg-zinc-900/40"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded bg-zinc-700 text-zinc-100 text-xs font-mono">
          #{index}
        </span>
        <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-mono">
          {patch.op}
        </span>
        <code className="text-xs">{patch.path}</code>
      </div>
      {patch.reason && (
        <p className="text-sm text-zinc-400 mb-3">{patch.reason}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="border border-zinc-700 rounded p-2 bg-zinc-950/40">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
            Original
          </div>
          <ValueView value={originalValue} />
        </div>
        <div className="border border-zinc-700 rounded p-2 bg-zinc-950/40">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {decision.kind === "edited" ? "Proposed (editing)" : "Proposed"}
            </div>
            {decision.kind === "edited" && (
              <button
                type="button"
                className="text-xs text-zinc-400 hover:text-zinc-200"
                onClick={() =>
                  onChange({
                    kind: "edited",
                    raw: stringifyForEdit(proposedValue),
                  })
                }
                title="Reset textarea to the LLM's proposed value"
              >
                reset
              </button>
            )}
          </div>
          {decision.kind === "edited" ? (
            <textarea
              className="w-full min-h-[12rem] font-mono text-xs p-2 bg-zinc-950 border border-zinc-700 rounded"
              value={decision.raw}
              spellCheck={false}
              onChange={(e) =>
                onChange({ kind: "edited", raw: e.target.value })
              }
            />
          ) : (
            <ValueView value={proposedValue} />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass(decision.kind === "pending", "pending")}
          onClick={() => onChange(PENDING)}
        >
          Pending
        </button>
        <button
          type="button"
          className={buttonClass(decision.kind === "accepted", "accepted")}
          onClick={() => onChange(ACCEPTED)}
        >
          Accept
        </button>
        <button
          type="button"
          className={buttonClass(decision.kind === "edited", "edited")}
          onClick={onClickEdit}
        >
          {decision.kind === "edited" ? "Editing…" : "Accept w/ edit"}
        </button>
        <button
          type="button"
          className={buttonClass(decision.kind === "rejected", "rejected")}
          onClick={() => onChange(REJECTED)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

type ReviewClientProps = {
  bundle: ReviewBundle;
};

function snapshotKey(file: AcceptedDecisionsFile): string {
  return JSON.stringify(file.topics);
}

export function ReviewClient({ bundle }: ReviewClientProps) {
  const { entries, warnings, accepted } = bundle;

  const articleRef = useRef<HTMLElement>(null);
  const { MathJaxScript } = useMathJax(articleRef);

  const [decisions, setDecisions] = useState<DecisionMap>(() =>
    buildInitialDecisions(entries, accepted)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => {
    const built = buildAcceptedFile(
      entries,
      buildInitialDecisions(entries, accepted)
    );
    return built.ok ? snapshotKey(built.file) : "";
  });
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [showFindings, setShowFindings] = useState(false);

  const currentEntry = entries[currentIndex];

  useEffect(() => {
    typesetMathInSubtree(articleRef.current);
  }, [currentIndex]);

  const setDecision = useCallback(
    (slug: string, patchIndex: number, next: Decision) => {
      setDecisions((prev) => {
        const copy: DecisionMap = new Map(prev);
        const inner = new Map(copy.get(slug) ?? new Map());
        inner.set(patchIndex, next);
        copy.set(slug, inner);
        return copy;
      });
    },
    []
  );

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setShowFindings(false);
  }, []);
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(entries.length - 1, i + 1));
    setShowFindings(false);
  }, [entries.length]);

  const handleSave = useCallback(async () => {
    if (saveState.kind === "saving") return;
    const built = buildAcceptedFile(entries, decisions);
    if (!built.ok) {
      setSaveState({ kind: "error", message: built.error });
      const idx = entries.findIndex((e) => e.slug === built.slug);
      if (idx >= 0) setCurrentIndex(idx);
      return;
    }
    setSaveState({ kind: "saving" });
    try {
      const res = await fetch("/api/review/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(built.file),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      setSavedSnapshot(snapshotKey(built.file));
      setSaveState({ kind: "saved", at: Date.now() });
    } catch (err) {
      setSaveState({ kind: "error", message: (err as Error).message });
    }
  }, [decisions, entries, saveState.kind]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, handleSave]);

  const currentBuild = useMemo(
    () => buildAcceptedFile(entries, decisions),
    [entries, decisions]
  );
  const dirty =
    !currentBuild.ok || snapshotKey(currentBuild.file) !== savedSnapshot;

  if (entries.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <MathJaxScript />
        <h1 className="text-2xl font-semibold mb-4">Topic Review</h1>
        <p className="mb-3">
          No review batch files found in
          <code className="mx-1">src/app/ml/wiki/content/review/</code>.
        </p>
        <p>
          Drop a <code>topics_reviewed_batch_NNN.json</code> file there and
          reload.
        </p>
        {warnings.length > 0 && (
          <div className="mt-6 p-3 border border-yellow-700 bg-yellow-950/40 rounded">
            <div className="font-medium mb-2">Warnings</div>
            <ul className="list-disc ml-5 text-sm">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    );
  }

  const innerDecisions = decisions.get(currentEntry.slug);
  const tally = currentEntry.jsonPatch.reduce(
    (acc, _, i) => {
      const d = innerDecisions?.get(i) ?? PENDING;
      acc[d.kind]++;
      return acc;
    },
    { pending: 0, accepted: 0, edited: 0, rejected: 0 } as Record<
      DecisionKind,
      number
    >
  );

  return (
    <main ref={articleRef} className="max-w-5xl mx-auto p-4">
      <MathJaxScript />
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 -mx-4 px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold mr-2">Topic Review</h1>
          <span className="text-sm text-zinc-400">
            {currentIndex + 1} / {entries.length}
          </span>
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-2 py-1 text-sm rounded border border-zinc-600 disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === entries.length - 1}
            className="px-2 py-1 text-sm rounded border border-zinc-600 disabled:opacity-40"
          >
            Next →
          </button>
          <select
            value={currentEntry.slug}
            onChange={(e) => {
              const idx = entries.findIndex((x) => x.slug === e.target.value);
              if (idx >= 0) {
                setCurrentIndex(idx);
                setShowFindings(false);
              }
            }}
            className="ml-2 px-2 py-1 text-sm rounded border border-zinc-600 bg-zinc-900"
          >
            {entries.map((entry, i) => {
              const inner = decisions.get(entry.slug);
              const total = entry.jsonPatch.length;
              const decided = entry.jsonPatch.reduce((acc, _, idx) => {
                const d = inner?.get(idx) ?? PENDING;
                return acc + (d.kind === "pending" ? 0 : 1);
              }, 0);
              return (
                <option key={entry.slug} value={entry.slug}>
                  {i + 1}. {entry.slug} ({decided}/{total})
                </option>
              );
            })}
          </select>
          <div className="ml-auto flex items-center gap-3">
            {dirty && <span className="text-xs text-yellow-400">● unsaved</span>}
            {saveState.kind === "saving" && (
              <span className="text-xs text-zinc-400">saving…</span>
            )}
            {saveState.kind === "saved" && !dirty && (
              <span className="text-xs text-green-500">saved</span>
            )}
            {saveState.kind === "error" && (
              <span
                className="text-xs text-red-400 max-w-[40ch] truncate"
                title={saveState.message}
              >
                save failed: {saveState.message}
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleSave()}
              className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </header>

      {warnings.length > 0 && (
        <div className="mb-4 p-3 border border-yellow-700 bg-yellow-950/40 rounded">
          <div className="font-medium mb-2 text-sm">Loader warnings</div>
          <ul className="list-disc ml-5 text-xs space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="mb-4">
        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <h2 className="text-xl font-semibold">{currentEntry.title}</h2>
          <code className="text-sm text-zinc-400">{currentEntry.slug}</code>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${severityColor(currentEntry.severity)}`}
          >
            severity: {currentEntry.severity}
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-100">
            {currentEntry.reviewStatus}
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300">
            {currentEntry.jsonPatch.length} patches
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-green-900/60 text-green-200">
            {tally.accepted} accepted
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-amber-900/60 text-amber-200">
            {tally.edited} edited
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-red-900/60 text-red-200">
            {tally.rejected} rejected
          </span>
          <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300">
            {tally.pending} pending
          </span>
        </div>
        {currentEntry.changeSummary.length > 0 && (
          <ul className="list-disc ml-5 text-sm mb-3">
            {currentEntry.changeSummary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
        {currentEntry.ruleFindings.length > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowFindings((v) => !v)}
              className="text-sm text-blue-400 hover:underline"
            >
              {showFindings ? "Hide" : "Show"} {currentEntry.ruleFindings.length} rule
              finding(s)
            </button>
            {showFindings && (
              <table className="mt-2 w-full text-xs border border-zinc-700">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left p-1">Rule</th>
                    <th className="text-left p-1">Severity</th>
                    <th className="text-left p-1">Field</th>
                    <th className="text-left p-1">Finding</th>
                    <th className="text-left p-1">Proposed fix</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntry.ruleFindings.map((f, i) => (
                    <tr key={i} className="border-t border-zinc-700 align-top">
                      <td className="p-1 font-mono">{f.rule}</td>
                      <td className="p-1">{f.severity}</td>
                      <td className="p-1 font-mono">{f.field}</td>
                      <td className="p-1">{f.finding}</td>
                      <td className="p-1">{f.proposedFix ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      <section>
        {currentEntry.jsonPatch.map((patch, i) => (
          <PatchCard
            key={i}
            index={i}
            patch={patch}
            entry={currentEntry}
            decision={innerDecisions?.get(i) ?? PENDING}
            onChange={(next) => setDecision(currentEntry.slug, i, next)}
          />
        ))}
      </section>

      <footer className="text-xs text-zinc-500 mt-6 pb-10">
        ←/→ to step topics · Ctrl/Cmd+S to save · output written to
        <code className="mx-1">topics_reviewed_accepted.json</code>
      </footer>
    </main>
  );
}
