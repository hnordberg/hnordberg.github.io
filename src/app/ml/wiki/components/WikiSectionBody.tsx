"use client";

import { useLayoutEffect, useRef } from "react";
import { typesetMathInSubtree } from "../../../components/MathJax";
import { enhanceWikiCodeBlocks } from "../lib/enhanceWikiCodeBlocks";
import "highlight.js/styles/github-dark.css";

type WikiSectionBodyProps = {
  html: string;
};

export function WikiSectionBody({ html }: WikiSectionBodyProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    enhanceWikiCodeBlocks(el);
    /** Runs after innerHTML commit so MathJax sees \\(, \\[, $$ in this subtree (newer topics embed display math here). */
    typesetMathInSubtree(el);
  }, [html]);

  return (
    <div
      ref={ref}
      className="wiki-section-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
