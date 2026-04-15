#!/usr/bin/env node
// Apply batch updates to src/app/ml/wiki/content/topics.json.
//
// Each batch file is a JSON object mapping slug -> { level?, prerequisites?, related? }.
// Only provided fields are replaced; other fields on the topic are left untouched.
//
// Usage: node scripts/ml-wiki/apply-topic-links.mjs <batch-file.json> [<batch-file.json>...]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const topicsPath = resolve(__dirname, "../../src/app/ml/wiki/content/topics.json");

const batchFiles = process.argv.slice(2);
if (batchFiles.length === 0) {
  console.error("usage: apply-topic-links.mjs <batch.json> [<batch.json>...]");
  process.exit(1);
}

const topics = JSON.parse(readFileSync(topicsPath, "utf8"));
const bySlug = new Map(topics.map((t) => [t.slug, t]));
const validLevels = new Set(["basic", "intro", "intermediate", "advanced"]);

let totalUpdates = 0;
const missingSlugs = [];
const missingRefs = [];

for (const batchFile of batchFiles) {
  const updates = JSON.parse(readFileSync(resolve(batchFile), "utf8"));
  const entries = Object.entries(updates);
  console.log(`\n${batchFile}: ${entries.length} topics`);

  for (const [slug, update] of entries) {
    const topic = bySlug.get(slug);
    if (!topic) {
      missingSlugs.push(slug);
      continue;
    }

    if (update.level !== undefined) {
      if (!validLevels.has(update.level)) {
        console.error(`  invalid level "${update.level}" on ${slug}`);
        process.exit(1);
      }
      topic.level = update.level;
    }

    if (update.prerequisites !== undefined) {
      for (const ref of update.prerequisites) {
        if (!bySlug.has(ref)) missingRefs.push(`${slug}.prerequisites -> ${ref}`);
      }
      topic.prerequisites = update.prerequisites;
    }

    if (update.related !== undefined) {
      for (const ref of update.related) {
        if (!bySlug.has(ref)) missingRefs.push(`${slug}.related -> ${ref}`);
        if (ref === slug) {
          console.error(`  self-reference in related on ${slug}`);
          process.exit(1);
        }
      }
      const prereqSet = new Set(topic.prerequisites ?? []);
      const dedupedRelated = update.related.filter((r) => !prereqSet.has(r));
      if (dedupedRelated.length !== update.related.length) {
        console.warn(
          `  ${slug}: dropped ${
            update.related.length - dedupedRelated.length
          } related that overlap with prerequisites`
        );
      }
      topic.related = dedupedRelated;
    }

    totalUpdates += 1;
  }
}

if (missingSlugs.length > 0) {
  console.error("\nUnknown slugs:");
  for (const s of missingSlugs) console.error(`  ${s}`);
  process.exit(1);
}
if (missingRefs.length > 0) {
  console.error("\nUnknown references:");
  for (const r of missingRefs) console.error(`  ${r}`);
  process.exit(1);
}

writeFileSync(topicsPath, JSON.stringify(topics, null, 2) + "\n");
console.log(`\nApplied ${totalUpdates} topic updates to ${topicsPath}`);
