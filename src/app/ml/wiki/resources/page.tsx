import type { Metadata } from "next";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "ML Learning Resources | ML Wiki",
  description:
    "Curated websites, books, courses, and videos for learning machine learning.",
};

export default function MlWikiResourcesPage() {
  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
        </p>
        <h1 className="wiki-page-title">ML Learning Resources</h1>
        <p className="wiki-lead">

        </p>
      </header>

      <section className="wiki-article">
        <h2>Websites</h2>
        <p>
          Placeholder. Write a paragraph or two introducing the websites that
          have been most useful for learning machine learning. Mention what
          each one is good for and how it complements the wiki.
        </p>
        <ul>
          <li>
            <strong>Placeholder website</strong> — short description of what it
            offers and why it&rsquo;s worth visiting.
          </li>
          <li>
            <strong>Placeholder website</strong> — short description of what it
            offers and why it&rsquo;s worth visiting.
          </li>
        </ul>

        <h2>Books</h2>
        <p>
          Placeholder. Introduce the books here. Note which are best read
          cover-to-cover versus used as references, and which assume what
          background.
        </p>
        <ul>
          <li>
            <strong>Placeholder book</strong> by Author — why it&rsquo;s worth
            reading and what level it targets.
          </li>
          <li>
            <strong>Placeholder book</strong> by Author — why it&rsquo;s worth
            reading and what level it targets.
          </li>
        </ul>

        <h2>Courses</h2>
        <p>
          Placeholder. Talk about the courses you recommend, who they&rsquo;re
          for, and what makes them stand out.
        </p>
        <ul>
          <li>
            <strong>Placeholder course</strong> — provider, level, and what it
            covers.
          </li>
          <li>
            <strong>Placeholder course</strong> — provider, level, and what it
            covers.
          </li>
        </ul>

        <h2>Videos</h2>
        <p>
          Placeholder. Recommend video channels and individual lectures here,
          with notes on what makes each one valuable.
        </p>
        <ul>
          <li>
            <strong>Placeholder video / channel</strong> — what you&rsquo;ll get
            out of it.
          </li>
          <li>
            <strong>Placeholder video / channel</strong> — what you&rsquo;ll get
            out of it.
          </li>
        </ul>
      </section>
    </WikiShell>
  );
}
