import type { Metadata } from "next";
import Link from "next/link";
import { getPaths } from "../lib/loadContent";

export const metadata: Metadata = {
  title: "ML Wiki — Learning paths | Henrik Nordberg",
  description: "Curated learning paths through the machine learning wiki.",
};

export default function MlWikiPathsIndexPage() {
  const { paths } = getPaths();

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
          Ordered sequences of topics. Open a path for next/previous navigation
          between cards.
        </p>
      </header>
      <ul className="wiki-path-list">
        {paths.map((p) => (
          <li key={p.slug} className="wiki-path-card card">
            <div className="card-title">
              <Link href={`/ml/wiki/paths/${p.slug}`}>{p.title}</Link>
            </div>
            <div className="card-text">{p.description}</div>
            {p.estimatedMinutes != null ? (
              <div className="card-title-subtitle">~{p.estimatedMinutes} minutes</div>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
