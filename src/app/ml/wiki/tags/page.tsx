import type { Metadata } from "next";
import Link from "next/link";
import { collectAllTags, getManifest } from "../lib/loadContent";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "ML Wiki — Tags | Henrik Nordberg",
  description: "Browse machine learning wiki topics by tag.",
};

export default function MlWikiTagsIndexPage() {
  const manifest = getManifest();
  const tags = collectAllTags();

  const counts = new Map<string, number>();
  for (const t of manifest.topics) {
    for (const tag of t.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
        </p>
        <h1 className="wiki-page-title">Tags</h1>
        <p className="wiki-lead">All tags used across wiki topics.</p>
      </header>
      <ul className="wiki-tag-directory">
        {tags.map((tag) => (
          <li key={tag}>
            <Link href={`/ml/wiki/tags/${encodeURIComponent(tag)}`}>
              {tag}
            </Link>
            <span className="wiki-muted"> ({counts.get(tag) ?? 0})</span>
          </li>
        ))}
      </ul>
    </WikiShell>
  );
}
