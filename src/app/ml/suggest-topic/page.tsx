import type { Metadata } from "next";
import WikiShell from "../wiki/components/WikiShell";
import WikiTopicSuggestForm from "./WikiTopicSuggestForm";

export const metadata: Metadata = {
  title: "Suggest a wiki topic | ML | Henrik Nordberg",
  description:
    "Suggest a new topic for the ML Wiki. Protected with Cloudflare Turnstile.",
};

export default function SuggestWikiTopicPage() {
  const siteKey = process.env.CLOUDFLARE_SITE_KEY ?? "";
  const submitUrl = process.env.NEXT_PUBLIC_WIKI_SUGGEST_URL ?? null;

  return (
    <WikiShell>
      <header className="wiki-hero">
        <p className="wiki-breadcrumb">
          <a href="/ml">Machine Learning</a>
        </p>
        <h1 className="wiki-page-title">Suggest a wiki topic</h1>
        <p className="wiki-lead">
          Ideas for concepts, learning-path gaps, or areas to expand. Requests
          are checked with Cloudflare Turnstile before they are accepted by the
          suggestion endpoint.
        </p>
      </header>

      <section className="wiki-suggest-section">
        <WikiTopicSuggestForm siteKey={siteKey} submitUrl={submitUrl} />
      </section>
    </WikiShell>
  );
}
