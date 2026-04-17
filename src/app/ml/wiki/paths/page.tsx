import type { Metadata } from "next";
import Link from "next/link";
import { getManifest, getPaths } from "../lib/loadContent";
import { resolvePathTopics } from "../lib/paths";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "ML Wiki — Learning paths | Henrik Nordberg",
  description: "Curated learning paths through the machine learning wiki.",
};

export default function MlWikiPathsIndexPage() {
  const { paths } = getPaths();
  const manifest = getManifest();

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
        </p>
        <h1 className="wiki-page-title">Learning paths</h1>
        <p className="wiki-lead">
          Guided sequences of topics moving from fundamental concepts to advanced techniques.
        </p>
      </header>
      <ul className="wiki-path-list card-grid">
        {paths.map((p) => {
          const matchedTopics = resolvePathTopics(manifest, p);
          return (
            <li key={p.slug} className="wiki-path-card card">
              <div className="card-title">
                <Link href={`/ml/wiki/paths/${p.slug}`}>{p.title}</Link>
              </div>
              <div className="card-text">{p.description}</div>
              <div style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                <div
                  className="card-title-subtitle"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span>{matchedTopics.length} topics</span>
                </div>
                <Link
                  href={`/ml/wiki/study?path=${encodeURIComponent(p.slug)}`}
                  className="wiki-topic-nav-btn"
                  aria-label={`Study ${p.title} with flashcards`}
                  style={{ padding: "0 1rem", height: "2.25rem", fontSize: "0.85rem" }}
                >
                  Study →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </WikiShell>
  );
}
