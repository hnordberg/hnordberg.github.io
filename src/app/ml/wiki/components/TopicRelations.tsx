import Link from "next/link";
import type { WikiManifest } from "../types";

type TopicRelationsProps = {
  prerequisites: string[];
  related: string[];
  titleBySlug: Map<string, string>;
};

function slugLinks(
  slugs: string[],
  titleBySlug: Map<string, string>
): { slug: string; title: string }[] {
  return slugs.map((slug) => ({
    slug,
    title: titleBySlug.get(slug) ?? slug,
  }));
}

export function TopicRelations({
  prerequisites,
  related,
  titleBySlug,
}: TopicRelationsProps) {
  const pre = slugLinks(prerequisites, titleBySlug);
  const rel = slugLinks(related, titleBySlug);

  if (pre.length === 0 && rel.length === 0) return null;

  return (
    <div className="wiki-relations">
      {pre.length > 0 ? (
        <div className="wiki-relations-block">
          <div className="wiki-relations-label">Prerequisites</div>
          <ul className="wiki-relations-list">
            {pre.map(({ slug, title }) => (
              <li key={slug}>
                <Link href={`/ml/wiki/${slug}`}>{title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {rel.length > 0 ? (
        <div className="wiki-relations-block">
          <div className="wiki-relations-label">Related</div>
          <ul className="wiki-relations-list">
            {rel.map(({ slug, title }) => (
              <li key={slug}>
                <Link href={`/ml/wiki/${slug}`}>{title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function buildTitleBySlug(manifest: WikiManifest): Map<string, string> {
  return new Map(manifest.topics.map((t) => [t.slug, t.title]));
}
