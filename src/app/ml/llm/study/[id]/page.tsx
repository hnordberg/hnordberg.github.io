import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import StudyClient from './StudyClient';
import type { Metadata } from 'next';

const studiesDir = path.join(process.cwd(), 'src/app/ml/llm/content/studies');

export async function generateStaticParams() {
  if (!fs.existsSync(studiesDir)) return [];
  const files = fs.readdirSync(studiesDir);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ id: f.replace('.json', '') }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const filePath = path.join(studiesDir, `${id}.json`);
  if (!fs.existsSync(filePath)) return { title: 'Not Found' };
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      title: `Study: ${content.shortTitle} | ML Papers`,
    };
  } catch (e) {
    return { title: 'Error' };
  }
}

export default async function StudyPage({ params }: Props) {
  const { id } = await params;
  const filePath = path.join(studiesDir, `${id}.json`);
  
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <StudyClient studyContent={content} />
      </main>
    );
  } catch (e) {
    console.error(`Error loading study metadata for ${id}:`, e);
    notFound();
  }
}
