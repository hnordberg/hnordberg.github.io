"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMathJax } from "../../../components/MathJax";
import type { WikiManifest, WikiTopic } from "../types";
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
            <div className="wiki-topic-title-row">
              <h1 className="wiki-article-title">{topic.title}</h1>
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
            <div className="wiki-sections">
              {topic.sections.map((s, idx) => (
                <SectionBlock key={idx} section={s} />
              ))}
            </div>
            <WikiTopicReferences topic={topic} />
            {topic.cards.length > 0 ? (
              <CardEvidence cards={topic.cards} />
            ) : null}
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
