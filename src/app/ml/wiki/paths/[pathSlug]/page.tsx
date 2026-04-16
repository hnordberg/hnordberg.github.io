import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getManifest, getPaths, getWikiCorpus } from "../../lib/loadContent";
import { resolvePathTopics } from "../../lib/paths";
import { PathStudyButton } from "../../flashcards";
type PageProps = { params: Promise<{ pathSlug: string }> };

export function generateStaticParams() {
  return getPaths().paths.map((p) => ({ pathSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pathSlug } = await params;
  const path = getPaths().paths.find((p) => p.slug === pathSlug);
  if (!path) return { title: "Not found" };
  return {
    title: `${path.title} | ML Wiki`,
    description: path.description,
  };
}

export default async function MlWikiPathDetailPage({ params }: PageProps) {
  const { pathSlug } = await params;
  const path = getPaths().paths.find((p) => p.slug === pathSlug);
  if (!path) notFound();

  const manifest = getManifest();
  const matchedTopics = resolvePathTopics(manifest, path);
  const topicsBySlug = getWikiCorpus().topicsBySlug;
  const pathCandidates = matchedTopics
    .filter((t) => (topicsBySlug.get(t.slug)?.sections.length ?? 0) > 0)
    .map((t) => ({ noteId: t.slug, topicSlug: t.slug }));

  return (
    <main className="wiki-main">
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki/paths">Paths</a>
        </p>
        <h1 className="wiki-page-title">{path.title}</h1>
        <p className="wiki-lead">{path.description}</p>
        {path.estimatedMinutes != null ? (
          <p className="wiki-meta-inline">Estimated time: ~{path.estimatedMinutes} min</p>
        ) : null}
      </header>

      <PathStudyButton pathSlug={path.slug} candidates={pathCandidates} />

      <ol className="wiki-path-steps" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--color-base-300)', paddingLeft: '1.5rem', marginLeft: '1rem' }}>
        {matchedTopics.map((topic, i) => {
          const slug = topic.slug;
          return (
            <li key={slug} className="wiki-path-step card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-2.2rem', top: '1.5rem', width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-primary-500)', border: '2px solid var(--color-bg)' }} />
              <div className="wiki-path-step-num" style={{ fontSize: '0.85rem', color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step {i + 1}
              </div>
              <div className="card-title">
                <Link href={`/ml/wiki/${slug}?path=${path.slug}`}>{topic.title}</Link>
              </div>
              <div className="card-text">
                {topic.summary}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="wiki-path-footer">
        <Link href="/ml/wiki/paths">All paths</Link>
        {" · "}
        <Link href="/ml/wiki">Wiki home</Link>
      </p>
    </main>
  );
}
