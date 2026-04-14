import type { WikiSection, WikiTopic } from "../types";
import { TopicChips } from "./TopicChips";
import { TopicRelations } from "./TopicRelations";

type WikiTopicSidebarProps = {
  topic: WikiTopic;
  titleBySlug: Map<string, string>;
  onMobileClose?: () => void;
};

/** Same source as `summaryFromSections` in the seed: first `<p>` of the first section with a body. */
function plainLeadFromSections(sections: WikiSection[]): string {
  for (const s of sections) {
    if (!s.body) continue;
    const m = s.body.match(/<p>([\s\S]*?)<\/p>/i);
    if (!m) continue;
    return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return "";
}

function sidebarSummaryDuplicatesLead(topic: WikiTopic): boolean {
  const intro = plainLeadFromSections(topic.sections);
  if (intro.length < 40) return false;
  const sum = topic.summary.replace(/\s+/g, " ").trim();
  if (!sum) return false;
  const introNorm = intro.replace(/\s+/g, " ").trim().toLowerCase();
  const sumNorm = sum.replace(/\s+/g, " ").trim().toLowerCase();
  if (introNorm === sumNorm) return true;
  const sumNoEllipsis = sumNorm.replace(/[….]{1,3}\s*$/u, "").trim();
  if (sumNoEllipsis.length >= 40 && introNorm.startsWith(sumNoEllipsis)) return true;
  return false;
}

export function WikiTopicSidebar({
  topic,
  titleBySlug,
  onMobileClose,
}: WikiTopicSidebarProps) {
  const showSummary = !sidebarSummaryDuplicatesLead(topic);

  return (
    <div className="wiki-sidebar-inner">
      <button
        type="button"
        className="wiki-sidebar-close"
        aria-label="Close topic information"
        onClick={onMobileClose}
      >
        ×
      </button>
      <p className="wiki-breadcrumb wiki-breadcrumb--sidebar">
        <a href="/ml">Machine Learning</a>
        <span aria-hidden> / </span>
        <a href="/ml/wiki">Wiki</a>
      </p>
      {showSummary ? (
        <p className="wiki-sidebar-summary">{topic.summary}</p>
      ) : null}
      <dl className="wiki-meta wiki-meta--sidebar">
        <div className="wiki-meta-item">
          <dt>Domain</dt>
          <dd>{topic.domain}</dd>
        </div>
        <div className="wiki-meta-item">
          <dt>Level</dt>
          <dd>{topic.level}</dd>
        </div>
        <div className="wiki-meta-item">
          <dt>Type</dt>
          <dd>{topic.type}</dd>
        </div>
        <div className="wiki-meta-item">
          <dt>Updated</dt>
          <dd>{topic.updatedAt}</dd>
        </div>
        <div className="wiki-meta-item wiki-meta-item--wide">
          <dt>Study deck</dt>
          <dd>{topic.sourceDeck}</dd>
        </div>
      </dl>
      <TopicChips tags={topic.tags} />
      <TopicRelations
        prerequisites={topic.prerequisites}
        related={topic.related}
        titleBySlug={titleBySlug}
      />
    </div>
  );
}
