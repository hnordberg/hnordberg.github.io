"use client";

import { useLayoutEffect, useRef } from "react";
import { enhanceWikiCodeBlocks } from "../lib/enhanceWikiCodeBlocks";
import "highlight.js/styles/github-dark.css";

type WikiSectionBodyProps = {
  html: string;
};

export function WikiSectionBody({ html }: WikiSectionBodyProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) enhanceWikiCodeBlocks(el);
  }, [html]);

  return (
    <div
      ref={ref}
      className="wiki-section-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
