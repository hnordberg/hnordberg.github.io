import type { Metadata } from "next";
import Link from "next/link";
import { getManifest, getPaths } from "../lib/loadContent";
import { resolvePathTopics } from "../lib/paths";

export const metadata: Metadata = {
  title: "ML Wiki — Learning paths | Henrik Nordberg",
  description: "Curated learning paths through the machine learning wiki.",
};

export default function MlWikiPathsIndexPage() {
  const { paths } = getPaths();
  const manifest = getManifest();

  return (
    <main className="wiki-main">
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
              <div className="card-title-subtitle" style={{ marginTop: "auto", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{matchedTopics.length} topics</span>
                {p.estimatedMinutes != null ? (
                  <span>~{p.estimatedMinutes} min</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
