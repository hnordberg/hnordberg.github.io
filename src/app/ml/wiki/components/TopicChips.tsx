import Link from "next/link";

type TopicChipsProps = {
  tags: string[];
};

export function TopicChips({ tags }: TopicChipsProps) {
  if (tags.length === 0) return null;
  return (
    <ul className="wiki-chips">
      {tags.map((tag) => (
        <li key={tag}>
          <Link href={`/ml/wiki/tags/${encodeURIComponent(tag)}`} className="wiki-chip">
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
