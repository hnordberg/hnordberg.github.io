"use client";

import Link from "next/link";
import { useRef } from "react";
import { useMathJax } from "../../../components/MathJax";

type FreshTopic = {
  slug: string;
  title: string;
  domain: string;
  level: string;
  summary: string;
};

export default function WikiHomeFreshList({ topics }: { topics: FreshTopic[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const { MathJaxScript } = useMathJax(listRef);

  return (
    <>
      <MathJaxScript />
      <ul ref={listRef} className="wiki-home-fresh-list">
        {topics.map((t) => (
          <li key={t.slug} className="wiki-home-fresh-row">
            <Link
              href={`/ml/wiki/${t.slug}`}
              className="wiki-home-fresh-link"
            >
              <div className="wiki-home-fresh-name">
                <p className="wiki-home-kicker">{t.domain}</p>
                <h3 className="wiki-home-fresh-title">{t.title}</h3>
              </div>
              <div className="wiki-home-fresh-level">
                {t.level.toUpperCase()}
              </div>
              <p className="wiki-home-fresh-summary">{t.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
