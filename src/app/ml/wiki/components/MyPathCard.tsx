"use client";

import Link from "next/link";
import { useWikiProgress } from "./useWikiProgress";

export function MyPathCard() {
  const { customPathSlugs } = useWikiProgress();
  const count = customPathSlugs.size;

  return (
    <li className="wiki-path-card card">
      <div className="card-title">
        <Link href="/ml/wiki/paths/my">My Learning Path</Link>
      </div>
      <div className="card-text">
        Topics you&rsquo;ve hand-picked from across the wiki. Add or remove any
        topic from its detail page or the topics index.
      </div>
      <div
        style={{
          marginTop: "auto",
          paddingTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          className="card-title-subtitle"
          style={{ display: "flex", alignItems: "center" }}
        >
          <span>
            {count === 0
              ? "0 topics — add some from any topic page"
              : `${count} topic${count === 1 ? "" : "s"}`}
          </span>
        </div>
        <Link
          href="/ml/wiki/paths/my"
          className="wiki-topic-nav-btn"
          aria-label="Open my learning path"
          style={{ padding: "0 1rem", height: "2.25rem", fontSize: "0.85rem" }}
        >
          Open →
        </Link>
      </div>
    </li>
  );
}
