import type { Metadata } from "next";
import { StudySession } from "../flashcards";
import WikiShell from "../components/WikiShell";

export const metadata: Metadata = {
  title: "Study | ML Wiki",
  description:
    "Spaced-repetition flashcards over the ML Wiki, scoped by learning path, tag, or topic.",
};

export default function MlWikiStudyPage() {
  const siteKey = process.env.CLOUDFLARE_SITE_KEY ?? "";
  const submitUrl = process.env.NEXT_PUBLIC_WIKI_SUGGEST_URL ?? null;

  return (
    <WikiShell>
      <StudySession siteKey={siteKey} submitUrl={submitUrl} />
    </WikiShell>
  );
}
