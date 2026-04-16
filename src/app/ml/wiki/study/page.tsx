import type { Metadata } from "next";
import { StudySession } from "../flashcards";

export const metadata: Metadata = {
  title: "Study | ML Wiki",
  description:
    "Spaced-repetition flashcards over the ML Wiki, scoped by learning path, tag, or topic.",
};

export default function MlWikiStudyPage() {
  return <StudySession />;
}
