import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getManifest, getPaths } from "../../lib/loadContent";

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
  const titleBySlug = new Map(manifest.topics.map((t) => [t.slug, t.title]));

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

      <ol className="wiki-path-steps">
        {path.topicSlugs.map((slug, i) => {
          const prev = i > 0 ? path.topicSlugs[i - 1] : null;
          const next =
            i < path.topicSlugs.length - 1 ? path.topicSlugs[i + 1] : null;
          const title = titleBySlug.get(slug) ?? slug;
          return (
            <li key={slug} className="wiki-path-step card">
              <div className="wiki-path-step-num">Step {i + 1}</div>
              <div className="card-title">
                <Link href={`/ml/wiki/${slug}`}>{title}</Link>
              </div>
              <nav className="wiki-path-step-nav" aria-label={`Navigation for ${title}`}>
                {prev ? (
                  <Link href={`/ml/wiki/${prev}`} className="wiki-path-nav-link">
                    ← Previous
                  </Link>
                ) : (
                  <span className="wiki-path-nav-disabled">← Previous</span>
                )}
                {next ? (
                  <Link href={`/ml/wiki/${next}`} className="wiki-path-nav-link">
                    Next →
                  </Link>
                ) : (
                  <span className="wiki-path-nav-disabled">Next →</span>
                )}
              </nav>
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
