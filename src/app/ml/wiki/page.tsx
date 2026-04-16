import type { Metadata } from "next";
import Link from "next/link";
import {
  collectAllTags,
  getManifest,
  getPaths,
  getWikiCorpus,
} from "./lib/loadContent";
import { WikiIndexFilter } from "./components/WikiIndexFilter";
import { TopicChips } from "./components/TopicChips";
import { HomeStats } from "./flashcards";

export const metadata: Metadata = {
  title: "ML Wiki | Henrik Nordberg",
  description:
    "Machine learning theory wiki generated from curated Anki notes: topics, tags, and learning paths.",
};

export default function MlWikiIndexPage() {
  const manifest = getManifest();
  const tags = collectAllTags();
  const paths = getPaths();
  const allCandidates = [...getWikiCorpus().topicsBySlug.values()]
    .filter((t) => t.sections.length > 0)
    .map((t) => ({ noteId: t.slug, topicSlug: t.slug }));

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
        <div className="card">
          <Link
            href="/ml/wiki/paths"
            className="card-title wiki-hub-card-heading-link"
          >
            Learning paths
          </Link>
          <div className="card-text">
            <ul className="list">
              {paths.paths.map((p) => (
                <li key={p.slug}>
                  <Link href={`/ml/wiki/paths/${p.slug}`}>{p.title}</Link>
                  {p.estimatedMinutes != null ? (
                    <span className="wiki-muted"> — ~{p.estimatedMinutes} min</span>
                  ) : null}
                </li>
              ))}
            </ul>
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
