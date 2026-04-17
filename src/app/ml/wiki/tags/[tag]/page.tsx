import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collectAllTags, getTopicsForTag } from "../../lib/loadContent";
import WikiShell from "../../components/WikiShell";

type PageProps = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return collectAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `Tag: ${decoded} | ML Wiki`,
    description: `Topics tagged “${decoded}”.`,
  };
}

export default async function MlWikiTagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const allTags = new Set(collectAllTags());
  if (!allTags.has(decoded)) notFound();

  const rows = getTopicsForTag(decoded);

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki/tags">Tags</a>
        </p>
        <h1 className="wiki-page-title">Tag: {decoded}</h1>
        <p className="wiki-lead">{rows.length} topic(s)</p>
      </header>
      <ul className="wiki-topic-list">
        {rows.map((t) => (
          <li key={t.slug} className="wiki-topic-list-item">
            <Link href={`/ml/wiki/${t.slug}`} className="wiki-topic-list-link">
              <span className="wiki-topic-list-title">{t.title}</span>
              <span className="wiki-topic-list-summary">{t.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </WikiShell>
  );
}
