"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { getWikiCorpus } from "../lib/loadContent";
import { resolvePathTopics } from "../lib/paths";
import type { WikiSection, WikiTopic } from "../types";
import { SectionBlock } from "../components/SectionBlock";
import { WikiTopicReferences } from "../components/WikiTopicReferences";
import { StudyDeck, type StudyCardInput } from "./components/StudyDeck";

type ResolvedScope = {
  label: string;
  cards: StudyCardInput[];
  backHref?: string;
  backLabel?: string;
};

/**
 * Build one flashcard per topic.
 *
 * Prompt is the topic title. The first section is the "primary answer" the
 * user is expected to recall; the remaining sections are surfaced behind a
 * "Dig deeper" expander so the full topic content is reachable without
 * leaving the card.
 *
 * `noteId` is the topic slug (stable identifier). Topics with no sections
 * are skipped: there's nothing meaningful to test on.
 */
function topicToCard(topic: WikiTopic): StudyCardInput | null {
  if (topic.sections.length === 0) return null;
  const [first, ...rest] = topic.sections;
  const primaryAnswer = <SectionBlock section={first!} />;

  const hasRest = rest.length > 0;
  const hasRefs =
    Boolean(topic.historyHtml?.trim()) ||
    Boolean(topic.referencesHtml?.trim()) ||
    (topic.papers?.length ?? 0) > 0;

  const extraAnswer =
    hasRest || hasRefs ? (
      <ExtraContent sections={rest} topic={topic} />
    ) : undefined;

  return {
    noteId: topic.slug,
    topicSlug: topic.slug,
    topicTitle: topic.title,
    prompt: topic.title,
    primaryAnswer,
    extraAnswer,
    tags: topic.tags,
  };
}

function ExtraContent({
  sections,
  topic,
}: {
  sections: WikiSection[];
  topic: WikiTopic;
}) {
  return (
    <div
      className="wiki-sections"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {sections.map((s, i) => (
        <SectionBlock key={i} section={s} />
      ))}
      <WikiTopicReferences topic={topic} />
    </div>
  );
}

function expandCards(topics: WikiTopic[]): StudyCardInput[] {
  const out: StudyCardInput[] = [];
  for (const topic of topics) {
    const card = topicToCard(topic);
    if (card) out.push(card);
  }
  return out;
}

function resolveScope(
  pathSlug: string | null,
  tag: string | null,
  topicSlug: string | null
): ResolvedScope {
  const corpus = getWikiCorpus();
  const allTopics = [...corpus.topicsBySlug.values()];

  if (topicSlug) {
    const topic = corpus.topicsBySlug.get(topicSlug);
    if (!topic) {
      return { label: `Topic: ${topicSlug} (not found)`, cards: [] };
    }
    return {
      label: `Topic: ${topic.title}`,
      cards: expandCards([topic]),
      backHref: `/ml/wiki/${topic.slug}`,
      backLabel: "Back to topic",
    };
  }

  if (pathSlug) {
    const path = corpus.paths.paths.find((p) => p.slug === pathSlug);
    if (!path) {
      return { label: `Path: ${pathSlug} (not found)`, cards: [] };
    }
    const matchedIndex = resolvePathTopics(corpus.manifest, path);
    const topics = matchedIndex
      .map((t) => corpus.topicsBySlug.get(t.slug))
      .filter((t): t is WikiTopic => !!t);
    return {
      label: `Path: ${path.title}`,
      cards: expandCards(topics),
      backHref: `/ml/wiki/paths/${path.slug}`,
      backLabel: "Back to path",
    };
  }

  if (tag) {
    const topics = allTopics.filter((t) => t.tags.includes(tag));
    return {
      label: `Tag: ${tag}`,
      cards: expandCards(topics),
      backHref: `/ml/wiki/tags/${encodeURIComponent(tag)}`,
      backLabel: "Back to tag",
    };
  }

  return {
    label: "All topics",
    cards: expandCards(allTopics),
    backHref: "/ml/wiki",
    backLabel: "Wiki home",
  };
}

function StudySessionInner({ siteKey, submitUrl }: { siteKey: string, submitUrl: string | null }) {
  const searchParams = useSearchParams();
  const pathSlug = searchParams?.get("path") ?? null;
  const tag = searchParams?.get("tag") ?? null;
  const topicSlug = searchParams?.get("topic") ?? null;

  const scope = useMemo(
    () => resolveScope(pathSlug, tag, topicSlug),
    [pathSlug, tag, topicSlug]
  );

  return (
    <>
      <header className="wiki-hero" style={{ marginBottom: "1.5rem" }}>
        <p className="wiki-breadcrumb">
          <Link href="/ml">Machine Learning</Link>
          <span aria-hidden> / </span>
          <Link href="/ml/wiki">Wiki</Link>
          <span aria-hidden> / </span>
          <span>Study</span>
        </p>
        <h1 className="wiki-page-title">Flashcards</h1>
        <p className="wiki-lead">
          Spaced repetition over the ML Wiki, scoped to{" "}
          <strong>{scope.label}</strong>.
        </p>
      </header>

      <StudyDeck
        cards={scope.cards}
        scopeLabel={scope.label}
        backHref={scope.backHref}
        backLabel={scope.backLabel}
        siteKey={siteKey}
        submitUrl={submitUrl}
      />
    </>
  );
}

export function StudySession({ siteKey, submitUrl }: { siteKey: string, submitUrl: string | null }) {
  return (
    <Suspense
      fallback={
        <p style={{ padding: "2rem", textAlign: "center", opacity: 0.7 }}>
          Loading flashcards…
        </p>
      }
    >
      <StudySessionInner siteKey={siteKey} submitUrl={submitUrl} />
    </Suspense>
  );
}
