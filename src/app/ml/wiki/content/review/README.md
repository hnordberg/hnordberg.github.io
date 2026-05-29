# Topic Review

Local-only workflow for auditing changes to [topics.json](../topics.json) against [FLASHCARDS.md](../FLASHCARDS.md). An LLM produces batch files of proposed edits; this app lets you walk through them and accept/reject each change before they get merged back.

## Files in this folder

- **[review_prompt.txt](review_prompt.txt)** — the prompt template handed to the reviewing LLM. Tells it to read the next slice of `topics.json`, score each topic against rules R1–R20 in `FLASHCARDS.md`, and emit a batch file.
- **[review_status_example.json](review_status_example.json)** — minimal example of one review entry (shapes only, no real content).
- **[topics_reviewed.example.json](topics_reviewed.example.json)** — fuller example showing every field on a single entry.
- **[reviewStatus.ts](reviewStatus.ts)** — the `ReviewStatus` enum (`ok`, `minor_edit`, `needs_changes`, `reject_or_regenerate`, `merge_candidate`, `split_candidate`).
- **`topics_reviewed_batch_NNN.json`** — input. Array of review entries from the LLM. Each entry has `slug`, `title`, `reviewStatus`, `severity`, `ruleFindings`, `original`, `proposed`, `jsonPatch`, `changeSummary`.
- **`topics_reviewed_accepted.json`** — output. Created/overwritten by the review app each time you save. Lists `acceptedPatches` and `rejectedPatches` per slug. Pending decisions are not written.

## Workflow

1. **Generate a batch.** Feed `review_prompt.txt` (adjusted for the topic range you want) plus the relevant slice of `topics.json` and `FLASHCARDS.md` to an LLM. Save the response as `topics_reviewed_batch_001.json` (next batch → `_002`, etc.) in this folder.
2. **Run the dev server.** From the repo root: `npm run dev`.
3. **Open the review app.** Navigate to <http://localhost:3000/ml/wiki/review>.
4. **Step through topics.** For each topic the page shows:
   - severity, `reviewStatus`, the LLM's change summary, and the rule findings (collapsed by default).
   - one card per `jsonPatch` entry with the original value (left) and proposed value (right) resolved at the patch's `path` (e.g. `/title`, `/sections/0/body`, `/cards/3/answer`).
   - a three-state toggle per patch: **Pending** / **Accept** / **Reject**.
   - a "Render HTML" checkbox when the value looks like HTML.
5. **Save.** Click *Save* (or `Ctrl/Cmd+S`). The app POSTs to `/api/review/save`, which writes `topics_reviewed_accepted.json` here. Reloading the page rehydrates your decisions from that file so you can resume mid-batch.
6. **Merge.** A separate (future) script reads `topics_reviewed_accepted.json`, applies each topic's `acceptedPatches` to `topics.json`, and writes the result back. Until that script exists, the accepted file is just a record of decisions.

## Keyboard shortcuts

- `←` / `→` — previous / next topic
- `Ctrl+S` / `Cmd+S` — save

## Notes & gotchas

- The batch file must be a **JSON array** of entries — the example file shows a single object for brevity, but real batches contain many.
- Multiple batch files are loaded together (`topics_reviewed_batch_*.json`, sorted by name). If two batches reference the same slug, the later filename wins and a warning is shown in the UI.
- Entries whose slug is not in `topics.json` are skipped with a warning.
- The save endpoint refuses requests unless `NODE_ENV=development`, so a stray production deploy can't write to the repo.
- `next.config.mjs` only enables `output: 'export'` when `NODE_ENV=production`, so `next dev` runs as a real Node server (needed by the API route). The POST handler is **not** compatible with static export — before running `next build` for a GitHub Pages deploy, temporarily delete `src/app/api/review/` (and `src/app/ml/wiki/review/`), or the build will fail.
- Do **not** edit `topics.json` directly while running this — only the merge step should touch it.
- `topics_reviewed_accepted.json` is regenerated on every save. Don't hand-edit it; redo the decision in the UI instead.

## Related code

- Page: [src/app/ml/wiki/review/page.tsx](../../review/page.tsx)
- Client UI: [src/app/ml/wiki/review/ReviewClient.tsx](../../review/ReviewClient.tsx)
- Loader: [src/app/ml/wiki/review/lib/loadReview.ts](../../review/lib/loadReview.ts)
- Save endpoint: [src/app/api/review/save/route.ts](../../../../api/review/save/route.ts)
