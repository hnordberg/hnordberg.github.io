import type { Metadata } from "next";
import Link from "next/link";
import { getManifest } from "../../lib/loadContent";
import WikiShell from "../../components/WikiShell";
import { MyPathContents } from "../../components/MyPathContents";

export const metadata: Metadata = {
  title: "My Learning Path | ML Wiki",
  description: "Topics you've added to your custom learning path.",
};

export default function MlWikiMyPathPage() {
  const manifest = getManifest();

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki/paths">Paths</a>
        </p>
        <h1 className="wiki-page-title">My Learning Path</h1>
        <p className="wiki-lead">
          The topics you&rsquo;ve added, sorted from foundational to advanced.
        </p>
      </header>

      <MyPathContents manifest={manifest} />

      <p className="wiki-path-footer">
        <Link href="/ml/wiki/paths">All paths</Link>
        {" · "}
        <Link href="/ml/wiki/topics">Browse topics</Link>
      </p>
    </WikiShell>
  );
}
