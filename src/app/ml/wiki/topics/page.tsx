import type { Metadata } from "next";
import { getManifest } from "../lib/loadContent";
import { WikiIndexFilter } from "../components/WikiIndexFilter";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "Topics | ML Wiki",
  description:
    "Search and filter every topic in the ML Wiki by title, summary, tag, or domain.",
};

export default function MlWikiTopicsIndexPage() {
  const manifest = getManifest();

  return (
    <WikiShell wide>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
        </p>
        <h1 className="wiki-page-title">Topics</h1>
        <p className="wiki-lead">
          Search and filter all {manifest.topics.length} topics in the wiki.
        </p>
      </header>
      <section className="wiki-index-section">
        <WikiIndexFilter manifest={manifest} />
      </section>
    </WikiShell>
  );
}
