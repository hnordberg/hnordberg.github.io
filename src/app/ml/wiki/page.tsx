import type { Metadata } from "next";
import Link from "next/link";
import {
  collectAllTags,
  getManifest,
  getPaths,
  getWikiCorpus,
} from "./lib/loadContent";
import { resolvePathTopics } from "./lib/paths";
import { WikiIndexFilter } from "./components/WikiIndexFilter";
import { TopicChips } from "./components/TopicChips";
import { HomeStats } from "./flashcards";

function formatStudyTime(minutes?: number): string {
  if (minutes == null) return "—";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

export const metadata: Metadata = {
  title: "ML Wiki | Henrik Nordberg",
  description:
    "Machine learning theory wiki generated from curated Anki notes: topics, tags, and learning paths.",
};

export default function MlWikiIndexPage() {
  const manifest = getManifest();
  const tags = collectAllTags();
  const paths = getPaths();
  const topicsBySlug = getWikiCorpus().topicsBySlug;
  const allCandidates = [...topicsBySlug.values()]
    .filter((t) => t.sections.length > 0)
    .map((t) => ({ noteId: t.slug, topicSlug: t.slug }));

  const pathRows = paths.paths.map((p) => ({
    slug: p.slug,
    title: p.title,
    cardCount: resolvePathTopics(manifest, p).filter(
      (t) => (topicsBySlug.get(t.slug)?.sections.length ?? 0) > 0
    ).length,
    estimatedMinutes: p.estimatedMinutes,
  }));

  return (
    <main className="wiki-main">
      <div className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
        </p>
        <h1 className="wiki-page-title">ML Wiki</h1>
        <p className="wiki-lead">
          Mini-wiki derived from the Anki deck <b><Link href="https://ankiweb.net/shared/info/2014176013?cb=1773248155654">{manifest.sourceDeck}</Link></b>.
          Browse by topic, filter below, or explore{" "}
          <Link href="/ml/wiki/paths">learning paths</Link>,{" "}
          <Link href="/ml/wiki/tags">all tags</Link>, or{" "}
          <Link href="/ml/wiki/study">flashcards</Link>.
        </p>
        <p className="wiki-meta-inline">
          Last content update: {manifest.updatedAt} · {manifest.topics.length}{" "}
          topics
        </p>
      </div>

      <section className="wiki-hub-links card-grid">
        <div className="card wiki-hub-card-span-2">
          <Link
            href="/ml/wiki/paths"
            className="card-title wiki-hub-card-heading-link"
          >
            Learning paths
          </Link>
          <div className="card-text">
            <table className="wiki-paths-table">
              <caption className="wiki-sr-only">
                Learning paths with card counts and estimated study time
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
                    <td className="wiki-paths-table-num">
                      {formatStudyTime(row.estimatedMinutes)}
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
          </div>
        </div>
        <div className="card">
          <div className="card-title">Tags</div>
          <div className="card-text">
            <TopicChips tags={tags.slice(0, 12)} />
            {tags.length > 12 ? (
              <p className="wiki-muted" style={{ marginTop: "0.75rem" }}>
                <Link href="/ml/wiki/tags">All tags →</Link>
              </p>
            ) : null}
          </div>
        </div>
        <HomeStats candidates={allCandidates} />
      </section>

      <section className="wiki-index-section">
        <h2 className="wiki-section-heading">Topics</h2>
        <WikiIndexFilter manifest={manifest} />
      </section>
    </main>
  );
}
