"use client";

import type { WikiSection } from "../types";
import { FigureBlock } from "./FigureBlock";
import { MathBlock } from "./MathBlock";

type SectionBlockProps = {
  section: WikiSection;
};

export function SectionBlock({ section }: SectionBlockProps) {
  const kindClass = `wiki-section wiki-section--${section.kind}`;

  return (
    <section className={kindClass}>
      {section.title ? (
        <h2 className="wiki-section-heading">{section.title}</h2>
      ) : null}
      {section.body ? (
        <div
          className="wiki-section-body"
          dangerouslySetInnerHTML={{ __html: section.body }}
        />
      ) : null}
      {section.equation ? (
        <MathBlock tex={section.equation} title={undefined} />
      ) : null}
      {section.figure ? <FigureBlock figure={section.figure} /> : null}
    </section>
  );
}
