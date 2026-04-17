import type { WikiPaperRef, WikiTopic } from "../types";

type WikiTopicReferencesProps = {
  topic: WikiTopic;
};

/** Deck exports often leave HTML entities in stripped footers; citations are plain text in the UI. */
function formatPaperCitation(citation: string): string {
  return citation
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&#x0*a0;/gi, " ")
    .replace(/&middot;|&#183;/gi, "·")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCitationForLinkedTitle(
  citation: string
): { prefix: string; title: string } {
  const parts = citation
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);

  // Canonical format is typically: "year · authors · title"
  if (parts.length >= 3) {
    const title = parts[parts.length - 1]!;
    const prefix = `${parts.slice(0, -1).join(" · ")} · `;
    return { prefix, title };
  }

  // Fallback: if we cannot reliably split, treat full citation as title.
  return { prefix: "", title: citation };
}

export function WikiTopicReferences({ topic }: WikiTopicReferencesProps) {
  const hasHistory = Boolean(topic.historyHtml?.trim());
  const hasRefs = Boolean(topic.referencesHtml?.trim());
  const papers = topic.papers ?? [];

  if (!hasHistory && !hasRefs && papers.length === 0) return null;

  const headingId = `wiki-refs-${topic.slug}`;

  return (
    <section className="wiki-references-block" aria-labelledby={headingId}>
      <h2 id={headingId} className="wiki-section-heading">
        History and references
      </h2>
      {hasHistory ? (
        <div
          className="wiki-references-body"
          dangerouslySetInnerHTML={{ __html: topic.historyHtml! }}
        />
      ) : null}
      {hasRefs ? (
        <div
          className="wiki-references-body wiki-references-body--refs"
          dangerouslySetInnerHTML={{ __html: topic.referencesHtml! }}
        />
      ) : null}
      {papers.length > 0 ? (
        <div className="wiki-papers">
          <ul className="wiki-papers-list">
            {papers.map((p, i) => (
              <WikiPaperLine key={i} paper={p} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function WikiPaperLine({ paper }: { paper: WikiPaperRef }) {
  const doiNorm = paper.doi?.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "");
  const href =
    paper.url ??
    (doiNorm ? `https://doi.org/${encodeURIComponent(doiNorm)}` : undefined);
  const label = formatPaperCitation(paper.citation);
  const { prefix, title } = splitCitationForLinkedTitle(label);
  return (
    <li className="wiki-papers-item">
      {prefix}
      {href ? (
        <a href={href} rel="noopener noreferrer" target="_blank">
          {title}
        </a>
      ) : (
        title
      )}
      {paper.note ? (
        <span className="wiki-papers-note"> — {paper.note}</span>
      ) : null}
    </li>
  );
}
