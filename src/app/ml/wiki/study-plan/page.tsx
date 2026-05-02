import type { Metadata } from "next";
import Link from "next/link";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "Make a study plan | ML Wiki",
  description:
    "Set goals, pick a learning path, and build a sustainable study routine.",
};

export default function MlWikiStudyPlanPage() {
  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
          <span aria-hidden> / </span>
          <a href="/ml/wiki">Wiki</a>
        </p>
        <h1 className="wiki-page-title">Make a study plan</h1>
        <p className="wiki-lead">
          A well-designed study plan is the foundation of a successful learning journey.
        </p>
      </header>

      <section className="wiki-article">
        <h2>Set a goal</h2>
        <p>
          Set a high-level goal, and then break it down into smaller, manageable steps.
          For example, if the overall goal is to understand the Transformer architecture, you might break it down into:
          <ul>
            <li>Understanding the attention mechanism</li>
            <li>Understanding the feedforward network</li>
            <li>Understanding the positional encoding</li>
            <li>etc.</li>
          </ul>
          But you may also want to add steps that cover the math and statistics needed.
        </p>

        <h2>Build a routine</h2>
        <p>
          Set a fixed schedule and stick to it. If you end up not sticking to it, adjust it.
        </p>

        <h2>Track progress</h2>
        <p>
          Keep a daily diary of what you study. Keep track of courses you take and books you read.
          Have a list of resources you want to use. You will come across many sites, courses, and 
          books and you can't read them all at once.
        </p>
      </section>
    </WikiShell>
  );
}
