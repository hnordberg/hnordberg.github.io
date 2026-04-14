"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WikiManifest } from "../types";

type WikiIndexFilterProps = {
  manifest: WikiManifest;
};

export function WikiIndexFilter({ manifest }: WikiIndexFilterProps) {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<string>("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return manifest.topics.filter((t) => {
      if (domain && t.domain !== domain) return false;
      if (!needle) return true;
      const hay = `${t.title} ${t.summary} ${t.tags.join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [manifest.topics, q, domain]);

  const domains = useMemo(() => {
    const s = new Set(manifest.topics.map((t) => t.domain));
    return [...s].sort();
  }, [manifest.topics]);

  return (
    <div className="wiki-index-controls">
      <div className="wiki-index-filters">
        <label className="wiki-filter-label">
          <span className="wiki-filter-span">Search</span>
          <input
            type="search"
            className="wiki-filter-input"
            placeholder="Title, summary, tags…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Filter topics"
          />
        </label>
        <label className="wiki-filter-label">
          <span className="wiki-filter-span">Domain</span>
          <select
            className="wiki-filter-select"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            aria-label="Filter by domain"
          >
            <option value="">All</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="wiki-index-count">
        Showing {filtered.length} of {manifest.topics.length} topics
      </p>
      <ul className="wiki-topic-list">
        {filtered.map((t) => (
          <li key={t.slug} className="wiki-topic-list-item">
            <Link href={`/ml/wiki/${t.slug}`} className="wiki-topic-list-link">
              <span className="wiki-topic-list-title">{t.title}</span>
              <span className="wiki-topic-list-meta">
                {t.domain} · {t.level}
              </span>
              <span className="wiki-topic-list-summary">{t.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
