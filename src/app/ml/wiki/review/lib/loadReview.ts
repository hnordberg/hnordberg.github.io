import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { getTopicBySlug } from "../../lib/loadContent";
import type {
  AcceptedDecisionsFile,
  ReviewBundle,
  TopicReviewEntry,
} from "../types";

const REVIEW_DIR = path.join(
  process.cwd(),
  "src",
  "app",
  "ml",
  "wiki",
  "content",
  "review"
);

const ACCEPTED_FILE = path.join(REVIEW_DIR, "topics_reviewed_accepted.json");

const BATCH_RE = /^topics_reviewed_batch_\d+\.json$/i;

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function looksLikeReviewEntry(v: unknown): v is TopicReviewEntry {
  if (!isObject(v)) return false;
  return (
    typeof v.slug === "string" &&
    isObject(v.original) &&
    isObject(v.proposed) &&
    Array.isArray(v.jsonPatch)
  );
}

async function readBatchFiles(): Promise<{
  entries: TopicReviewEntry[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  let dirEntries: string[] = [];
  try {
    dirEntries = await fs.readdir(REVIEW_DIR);
  } catch (err) {
    warnings.push(`Could not read review dir: ${(err as Error).message}`);
    return { entries: [], warnings };
  }

  const batchFiles = dirEntries.filter((name) => BATCH_RE.test(name)).sort();
  const seen = new Map<string, { file: string; entry: TopicReviewEntry }>();

  for (const file of batchFiles) {
    const full = path.join(REVIEW_DIR, file);
    let parsed: unknown;
    try {
      const raw = await fs.readFile(full, "utf8");
      parsed = JSON.parse(raw);
    } catch (err) {
      warnings.push(`Could not parse ${file}: ${(err as Error).message}`);
      continue;
    }
    if (!Array.isArray(parsed)) {
      warnings.push(`${file}: expected an array of review entries.`);
      continue;
    }
    for (let i = 0; i < parsed.length; i++) {
      const raw = parsed[i];
      if (!looksLikeReviewEntry(raw)) {
        warnings.push(`${file}[${i}]: malformed review entry, skipped.`);
        continue;
      }
      if (!getTopicBySlug(raw.slug)) {
        warnings.push(
          `${file}[${i}]: slug "${raw.slug}" not found in topics.json, skipped.`
        );
        continue;
      }
      const prior = seen.get(raw.slug);
      if (prior) {
        warnings.push(
          `Duplicate slug "${raw.slug}" — using ${file} (was ${prior.file}).`
        );
      }
      seen.set(raw.slug, { file, entry: raw });
    }
  }

  return {
    entries: [...seen.values()].map((v) => v.entry),
    warnings,
  };
}

async function readAcceptedFile(): Promise<AcceptedDecisionsFile> {
  try {
    const raw = await fs.readFile(ACCEPTED_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      isObject(parsed) &&
      parsed.version === 1 &&
      Array.isArray(parsed.topics)
    ) {
      return parsed as AcceptedDecisionsFile;
    }
  } catch {
    // file may not exist yet
  }
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    topics: [],
  };
}

export async function loadReviewBundle(): Promise<ReviewBundle> {
  const [{ entries, warnings }, accepted] = await Promise.all([
    readBatchFiles(),
    readAcceptedFile(),
  ]);
  return { entries, warnings, accepted };
}

export const REVIEW_DIR_PATH = REVIEW_DIR;
export const ACCEPTED_FILE_PATH = ACCEPTED_FILE;
