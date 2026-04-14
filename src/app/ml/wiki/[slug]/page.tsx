import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllTopicSlugs,
  getManifest,
  getTopicBySlug,
} from "../lib/loadContent";
import { WikiTopicClient } from "../components/WikiTopicClient";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Not found" };
  return {
    title: `${topic.title} | ML Wiki`,
    description: topic.summary,
  };
}

export default async function MlWikiTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();
  const manifest = getManifest();

  return (
    <main className="wiki-main wiki-main--wide">
      <WikiTopicClient topic={topic} manifest={manifest} />
    </main>
  );
}
