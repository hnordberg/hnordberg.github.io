import type { Metadata } from "next";
import Link from "next/link";
import { getManifest, getPaths, getWikiCorpus } from "./lib/loadContent";
import { resolvePathTopics } from "./lib/paths";
import WikiShell from "./components/WikiShell";

export const metadata: Metadata = {
  title: "ML Wiki | Henrik Nordberg",
  description:
    "A free, rigorous resource for learning machine learning with a focus on mathematics and conceptual depth.",
};

export default function MlWikiIndexPage() {
  const manifest = getManifest();
  const paths = getPaths();
  const topicsBySlug = getWikiCorpus().topicsBySlug;

  const pathRows = paths.paths.map((p) => ({
    slug: p.slug,
    title: p.title,
    cardCount: resolvePathTopics(manifest, p).filter(
      (t) => (topicsBySlug.get(t.slug)?.sections.length ?? 0) > 0
    ).length,
  }));

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
        </p>
        <h1 className="wiki-page-title">ML Wiki</h1>
        <p className="wiki-lead">
          A free, open resource for learning machine learning with a focus on
          the underlying mathematics and conceptual rigor. Work through guided{" "}
          <Link href="/ml/wiki/paths">learning paths</Link>, browse the full{" "}
          <Link href="/ml/wiki/topics">topic index</Link>, explore{" "}
          <Link href="/ml/wiki/tags">tags</Link>, or test yourself with{" "}
          <Link href="/ml/wiki/study">spaced-repetition flashcards</Link>.
        </p>
      </header>

      <section>
        <h2 className="wiki-section-heading">Start a learning path</h2>
        <p className="wiki-muted" style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          Curated sequences that build understanding from fundamentals to advanced techniques.
        </p>
        <table className="wiki-paths-table">
          <caption className="wiki-sr-only">
            Learning paths with card counts
          </caption>
          <tbody>
            {pathRows.map((row) => (
              <tr key={row.slug}>
                <th scope="row" className="wiki-paths-table-title">
                  <Link href={`/ml/wiki/paths/${row.slug}`}>{row.title}</Link>
                </th>
                <td className="wiki-paths-table-num">
                  {row.cardCount}
                  <span className="wiki-paths-table-unit"> cards</span>
                </td>
                <td className="wiki-paths-table-action">
                  <Link
                    href={`/ml/wiki/study?path=${encodeURIComponent(row.slug)}`}
                    className="wiki-topic-nav-btn wiki-paths-table-btn"
                    aria-label={`Study ${row.title} with flashcards`}
                  >
                    Study →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="wiki-meta-inline" style={{ marginTop: "2.5rem" }}>
        {manifest.topics.length} topics · last content update {manifest.updatedAt} · flashcards derived from the Anki deck{" "}
        <Link href="https://ankiweb.net/shared/info/2014176013?cb=1773248155654">
          {manifest.sourceDeck}
        </Link>
        .
      </p>
    </WikiShell>
  );
}
