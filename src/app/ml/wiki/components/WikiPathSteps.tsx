"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { typesetMathInSubtree, useMathJax } from "../../../components/MathJax";
import type { WikiTopicIndexEntry } from "../types";

type WikiPathStepsProps = {
  pathSlug: string;
  topics: WikiTopicIndexEntry[];
};

/** Path topic list with MathJax for summaries that contain TeX (e.g. `\\( … \\)`). */
export function WikiPathSteps({ pathSlug, topics }: WikiPathStepsProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const { MathJaxScript } = useMathJax(listRef);

  useEffect(() => {
    typesetMathInSubtree(listRef.current);
  }, [topics]);

  return (
    <>
      <MathJaxScript />
      <ol
        ref={listRef}
        className="wiki-path-steps"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          borderLeft: "2px solid var(--color-base-300)",
          paddingLeft: "1.5rem",
          marginLeft: "1rem",
        }}
      >
        {topics.map((topic, i) => {
          const slug = topic.slug;
          return (
            <li key={slug} className="wiki-path-step card" style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-2.2rem",
                  top: "1.5rem",
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary-500)",
                  border: "2px solid var(--color-bg)",
                }}
              />
              <div
                className="wiki-path-step-num"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-base-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Step {i + 1}
              </div>
              <div className="card-title">
                <Link href={`/ml/wiki/${slug}?path=${pathSlug}`}>{topic.title}</Link>
              </div>
              <div className="card-text">{topic.summary}</div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
