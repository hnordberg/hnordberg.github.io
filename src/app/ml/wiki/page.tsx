import type { Metadata } from "next";
import Link from "next/link";
import { getManifest, getWikiCorpus } from "./lib/loadContent";
import { resolvePathTopics } from "./lib/paths";
import WikiShell from "./components/WikiShell";
import WikiHomeFreshList from "./components/WikiHomeFreshList";

export const metadata: Metadata = {
  title: "ML Wiki | Henrik Nordberg",
  description:
    "A free, rigorous resource for learning machine learning with a focus on mathematics and conceptual depth.",
};

const FEATURED_PATH_SLUGS = [
  "core-foundations",
  "architectures",
  "transformer-llm",
  "alignment-safety",
];

const STUDY_LOOP = [
  {
    title: "Read the summary",
    body: "Answer the prompt quickly from the title and reveal the canonical answer.",
  },
  {
    title: "Dig deeper",
    body: "Open the mechanism, derivation, example, or contrast only when you need it.",
  },
  {
    title: "Return with flashcards",
    body: "Use spaced repetition to turn the page into durable recall.",
  },
];

const CONCEPT_CLUSTERS = [
  {
    kicker: "Mathematical foundations",
    title: "Build the formal base first",
    slugs: [
      "linear-regression-basics",
      "bias-variance-tradeoff",
      "lagrange-multipliers",
    ],
  },
  {
    kicker: "Optimization & training",
    title: "See why models converge or fail",
    slugs: [
      "gradient-descent",
      "adamw-optimizer",
      "gradient-checkpointing-activation-recomputation",
    ],
  },
  {
    kicker: "Attention & transformers",
    title: "Trace the core architecture family",
    slugs: [
      "causal-masked-self-attention",
      "rotary-positional-embedding-rope",
      "key-value-kv-caching",
    ],
  },
  {
    kicker: "RL & alignment",
    title: "Move from reward to safety",
    slugs: [
      "the-bellman-equation",
      "proximal-policy-optimization-ppo",
      "chain-of-thought-monitorability",
    ],
  },
  {
    kicker: "Systems & scaling",
    title: "Learn how large models are served",
    slugs: [
      "zero-zero-redundancy-optimizer",
      "pagedattention",
      "speculative-decoding",
    ],
  },
  {
    kicker: "Vision & generative",
    title: "Bridge images, latent spaces, and diffusion",
    slugs: [
      "imagenet-dataset",
      "autoencoders",
      "denoising-diffusion-probabilistic-models-ddpm",
    ],
  },
];

const ENTRY_POINTS = [
  {
    kicker: "Guided sequence",
    title: "Start a path",
    href: "/ml/wiki/paths",
    body: "Best for learners who want ordered progression from foundations to advanced topics.",
    bullets: ["Curated sequences", "Topic counts up front", "One clear first action"],
  },
  {
    kicker: "Thematic browsing",
    title: "Explore clusters",
    href: "/ml/wiki/tags",
    body: "Best for readers who already know what neighborhood they want: optimization, attention, systems, or RL.",
    bullets: ["Concept families", "Clear sample topics", "Less index fatigue"],
  },
  {
    kicker: "Spaced repetition",
    title: "Review flashcards",
    href: "/ml/wiki/study",
    body: "Best for retrieval practice after reading. The study loop is one click away.",
    bullets: ["Recall-first", "Honest self-rating", "Short return path"],
  },
  {
    kicker: "Fresh material",
    title: "See what changed",
    href: "/ml/wiki/topics",
    body: "Best for repeat visitors who want new additions, recent edits, or timely topics without scrolling a path list.",
    bullets: ["Recent topics", "Updated collections", "Lower revisit friction"],
  },
];

export default function MlWikiIndexPage() {
  const manifest = getManifest();
  const corpus = getWikiCorpus();
  const topicsBySlug = corpus.topicsBySlug;
  const allPaths = corpus.paths.paths;

  const topicCount = manifest.topics.length;
  const pathCount = allPaths.length;
  const domainCount = new Set(manifest.topics.map((t) => t.domain)).size;
  const updatedAt = manifest.topics.reduce(
    (max, t) => (t.updatedAt > max ? t.updatedAt : max),
    manifest.updatedAt
  );

  const pathBySlug = new Map(allPaths.map((p) => [p.slug, p]));
  const featuredPaths = FEATURED_PATH_SLUGS.map((slug) => pathBySlug.get(slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  const featuredPathCards = featuredPaths.map((p) => {
    const topics = resolvePathTopics(manifest, p).filter(
      (t) => (topicsBySlug.get(t.slug)?.sections.length ?? 0) > 0
    );
    return {
      slug: p.slug,
      title: p.title,
      description: p.description,
      topicCount: topics.length,
      sampleTopics: topics.slice(0, 3).map((t) => t.title),
    };
  });

  const topicTitleBySlug = new Map(
    manifest.topics.map((t) => [t.slug, t.title])
  );

  const conceptClusterCards = CONCEPT_CLUSTERS.map((c) => ({
    kicker: c.kicker,
    title: c.title,
    topics: c.slugs
      .map((slug) => {
        const title = topicTitleBySlug.get(slug);
        return title ? { slug, title } : null;
      })
      .filter((t): t is { slug: string; title: string } => Boolean(t)),
  }));

  const recentTopics = manifest.topics
    .filter((t) => (topicsBySlug.get(t.slug)?.sections.length ?? 0) > 0)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <WikiShell wide>
      <div className="wiki-home">
        <section className="wiki-home-hero">
          <div className="wiki-home-hero-left">
            <h1 className="wiki-home-headline">
              A rigorous machine learning curriculum built for{" "}
              <span className="wiki-home-accent-blue">recall</span> and{" "}
              <span className="wiki-home-accent-amber">understanding</span>.
            </h1>
            <p className="wiki-home-lead">
              Study a topic in one sentence, open the derivation only when you
              need it, and return later with spaced repetition.
            </p>
            <div className="wiki-home-cta">
              <Link
                href="/ml/wiki/paths/core-foundations"
                className="wiki-home-btn-primary"
              >
                Start with Foundations
              </Link>
              <Link href="/ml/wiki/topics" className="wiki-home-btn-ghost">
                Browse topics
              </Link>
              <Link href="/ml/wiki/study" className="wiki-home-btn-ghost">
                Review flashcards
              </Link>
            </div>
            <p className="wiki-home-meta-row">
              <span>
                <strong>{topicCount}</strong> topics
              </span>
              <span>
                <strong>{pathCount}</strong> learning paths
              </span>
              <span>{updatedAt} last update</span>
              <span>
                <strong>{domainCount}</strong> domains
              </span>
            </p>
          </div>

          <aside className="wiki-home-panel">
            <p className="wiki-home-kicker">Today in the wiki</p>
            <h2 className="wiki-home-panel-title">
              Study faster without flattening the subject.
            </h2>

            <div className="wiki-home-stat-grid">
              <div className="wiki-home-stat">
                <div className="wiki-home-stat-num">{topicCount}</div>
                <div className="wiki-home-stat-label">Topics</div>
              </div>
              <div className="wiki-home-stat">
                <div className="wiki-home-stat-num">{pathCount}</div>
                <div className="wiki-home-stat-label">Learning paths</div>
              </div>
              <div className="wiki-home-stat">
                <div className="wiki-home-stat-num">{domainCount}</div>
                <div className="wiki-home-stat-label">Domains</div>
              </div>
              <div className="wiki-home-stat">
                <div className="wiki-home-stat-num wiki-home-stat-num--small">
                  {updatedAt}
                </div>
                <div className="wiki-home-stat-label">Last content update</div>
              </div>
            </div>

            <div className="wiki-home-loop">
              <p className="wiki-home-kicker">Study loop</p>
              <ol className="wiki-home-loop-list">
                {STUDY_LOOP.map((step, i) => (
                  <li key={step.title} className="wiki-home-loop-item">
                    <span className="wiki-home-loop-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <div className="wiki-home-loop-title">{step.title}</div>
                      <p className="wiki-home-loop-desc">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>

        <section className="wiki-home-section">
          <p className="wiki-home-kicker">Entry points</p>
          <h2 className="wiki-home-section-heading">Choose your way in</h2>
          <div className="wiki-home-entry-grid">
            {ENTRY_POINTS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="wiki-home-entry-card"
              >
                <p className="wiki-home-kicker">{card.kicker}</p>
                <h3 className="wiki-home-entry-title">{card.title}</h3>
                <p className="wiki-home-entry-body">{card.body}</p>
                <ul className="wiki-home-entry-bullets">
                  {card.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>

        <section className="wiki-home-section">
          <p className="wiki-home-kicker">Curriculum</p>
          <h2 className="wiki-home-section-heading">Featured learning paths</h2>
          <div className="wiki-home-paths-grid">
            {featuredPathCards.map((p) => (
              <article key={p.slug} className="wiki-home-path-card">
                <div className="wiki-home-path-card-head">
                  <p className="wiki-home-kicker">Learning path</p>
                  <span className="wiki-home-path-count">
                    {p.topicCount} topics
                  </span>
                </div>
                <h3 className="wiki-home-path-title">
                  <Link href={`/ml/wiki/paths/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="wiki-home-path-desc">{p.description}</p>
                <ul className="wiki-home-path-chips">
                  {p.sampleTopics.map((t) => (
                    <li key={t} className="wiki-home-path-chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="wiki-home-path-foot">
                  Summary-first · Dig deeper · Study mode
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="wiki-home-section">
          <p className="wiki-home-kicker">Browse by idea family</p>
          <h2 className="wiki-home-section-heading">Concept clusters</h2>
          <div className="wiki-home-cluster-grid">
            {conceptClusterCards.map((c) => (
              <article key={c.title} className="wiki-home-cluster-card">
                <p className="wiki-home-kicker">{c.kicker}</p>
                <h3 className="wiki-home-cluster-title">{c.title}</h3>
                <ul className="wiki-home-cluster-list">
                  {c.topics.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/ml/wiki/${t.slug}`}
                        className="wiki-home-cluster-link"
                      >
                        <span
                          aria-hidden="true"
                          className="wiki-home-cluster-arrow"
                        >
                          ↗
                        </span>
                        <span>{t.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="wiki-home-section">
          <p className="wiki-home-kicker">Recently updated</p>
          <h2 className="wiki-home-section-heading">
            Fresh topics worth opening
          </h2>
          <WikiHomeFreshList
            topics={recentTopics.map((t) => ({
              slug: t.slug,
              title: t.title,
              domain: t.domain,
              level: t.level,
              summary: t.summary,
            }))}
          />
        </section>
      </div>
    </WikiShell>
  );
}
