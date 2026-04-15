"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import pathsJson from "../content/paths.json";
import { resolvePathTopics, sortTopics } from "../lib/paths";
import { useWikiProgress } from "./useWikiProgress";
import type { WikiPathsFile } from "../types";
import { useMathJax } from "../../../components/MathJax";
import type { WikiManifest, WikiTopic, WikiTopicIndexEntry } from "../types";
import { buildTitleBySlug } from "./TopicRelations";
import { SectionBlock } from "./SectionBlock";
import { CardEvidence } from "./CardEvidence";
import { WikiTopicReferences } from "./WikiTopicReferences";
import { WikiTopicSidebar } from "./WikiTopicSidebar";

type WikiTopicClientProps = {
  topic: WikiTopic;
  manifest: WikiManifest;
};

export function WikiTopicClient({ topic, manifest }: WikiTopicClientProps) {
  const mathRef = useRef<HTMLDivElement>(null);
  const { MathJaxScript } = useMathJax(mathRef);
  const titleBySlug = buildTitleBySlug(manifest);
  const [infoOpen, setInfoOpen] = useState(false);

  const searchParams = useSearchParams();
  const currentPathSlug = searchParams?.get("path");
  const { markCompleted } = useWikiProgress();

  const { prev, next, pathContext, topicsList, currentIndex } = useMemo(() => {
    let topicsList = sortTopics(manifest.topics);
    let pathContext = null;
    
    if (currentPathSlug) {
      const pathsFile = pathsJson as unknown as WikiPathsFile;
      const foundPath = pathsFile.paths.find((p) => p.slug === currentPathSlug);
      if (foundPath) {
        pathContext = foundPath;
        topicsList = resolvePathTopics(manifest, foundPath);
      }
    }

    const i = topicsList.findIndex((t) => t.slug === topic.slug);
    if (i < 0) {
      return { prev: null as WikiTopicIndexEntry | null, next: null as WikiTopicIndexEntry | null, pathContext, topicsList, currentIndex: -1 };
    }
    return {
      prev: i > 0 ? topicsList[i - 1]! : null,
      next: i < topicsList.length - 1 ? topicsList[i + 1]! : null,
      pathContext,
      topicsList,
      currentIndex: i
    };
  }, [manifest, topic.slug, currentPathSlug]);

  const closeInfo = useCallback(() => setInfoOpen(false), []);

  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInfo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoOpen, closeInfo]);

  useEffect(() => {
    if (!infoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [infoOpen]);

  return (
    <>
      <MathJaxScript />
      <article className="wiki-article" ref={mathRef}>
        <div
          className={`wiki-topic-layout${infoOpen ? " wiki-topic-layout--info-open" : ""}`}
        >
          <div className="wiki-topic-main">
            {pathContext && currentIndex >= 0 ? (
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-base-200)', paddingBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  <Link href={`/ml/wiki/paths/${pathContext.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>Path: {pathContext.title}</Link>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  Step {currentIndex + 1} of {topicsList.length}
                </div>
                <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--color-base-200)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((currentIndex + 1) / topicsList.length) * 100}%`, backgroundColor: 'var(--color-primary-500)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ) : null}
            <div className="wiki-topic-title-row">
              <h1 className="wiki-article-title">{topic.title}</h1>
              <div className="wiki-topic-title-actions">
                {prev ? (
                  <Link
                    href={`/ml/wiki/${prev.slug}${currentPathSlug ? `?path=${currentPathSlug}` : ""}`}
                    className="wiki-topic-nav-btn"
                    aria-label={`Previous article: ${prev.title}`}
                  >
                    <span aria-hidden>← Prev</span>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    href={`/ml/wiki/${next.slug}${currentPathSlug ? `?path=${currentPathSlug}` : ""}`}
                    className="wiki-topic-nav-btn"
                    aria-label={`Next article: ${next.title}`}
                  >
                    <span aria-hidden>Next →</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="wiki-info-btn"
                  aria-expanded={infoOpen}
                  aria-controls="wiki-topic-sidebar"
                  id="wiki-topic-info-trigger"
                  onClick={() => setInfoOpen((o) => !o)}
                >
                  <span className="wiki-info-icon" aria-hidden>
                    ℹ
                  </span>
                  <span className="wiki-sr-only">Topic information</span>
                </button>
              </div>
            </div>
            <div className="wiki-sections">
              {topic.sections.map((s, idx) => (
                <SectionBlock key={idx} section={s} />
              ))}
            </div>
            <WikiTopicReferences topic={topic} />
            {topic.cards.length > 0 ? (
              <CardEvidence cards={topic.cards} />
            ) : null}
            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-base-200)', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="wiki-topic-nav-btn" 
                style={{ padding: '0.75rem 2rem', height: 'auto', fontSize: '1rem', cursor: 'pointer' }}
                onClick={() => {
                  markCompleted(topic.slug);
                  if (next) {
                    window.location.href = `/ml/wiki/${next.slug}${currentPathSlug ? `?path=${currentPathSlug}` : ""}`;
                  }
                }}
              >
                Mark as Complete & Next →
              </button>
            </div>
          </div>

          <div
            className="wiki-sidebar-backdrop"
            aria-hidden={!infoOpen}
            onClick={closeInfo}
          />

          <aside
            className="wiki-sidebar"
            id="wiki-topic-sidebar"
            aria-labelledby="wiki-topic-info-trigger"
          >
            <WikiTopicSidebar
              topic={topic}
              titleBySlug={titleBySlug}
              onMobileClose={closeInfo}
            />
          </aside>
        </div>
      </article>
    </>
  );
}
