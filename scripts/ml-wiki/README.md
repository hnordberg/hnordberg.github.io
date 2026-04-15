# ML Wiki content pipeline

Generated site content lives under `src/app/ml/wiki/content/`:

| File | Role |
|------|------|
| `topics.json` | Full array of wiki topics (single source for page bodies + cards). |
| `manifest.json` | Deck metadata + **list of topic slugs** (must match `topics.json` exactly). |
| `paths.json` | Curated learning paths (`topicSlugs` must exist in `topics.json`). |

## Automated batch import (canonical loop)

Use this when you want the next slice of the study deck as normal wiki articles (structured `sections[]`, empty `cards[]`, footer → `papers`). HTML conversion is shared in `lib/deck-to-wiki.mjs` and used by both `seed-five-notes.mjs` and `import-anki-batch.mjs`.

**Canonical command:** `npm run ml-wiki:import-batch` runs `scripts/ml-wiki/import-anki-batch.mjs` and **merges** into `topics.json` and `manifest.json`. Equivalent: `node scripts/ml-wiki/import-anki-batch.mjs` with the same flags after `--`. This path is **not** the same as `import-from-notes.mjs` (that script **replaces** all of `topics.json` from grouped notes).

**Default batch size:** Unless you specify otherwise (in chat or with a different `--count`), treat “the next set” as **10** notes.

**Prerequisites:** Anki running with [AnkiConnect](https://foosoft.net/anki-connect/) on `http://127.0.0.1:8765` (override with `ANKI_CONNECT_URL` if needed).

**Deck name (exact):** `Machine Learning by Henrik Nordberg`

**Command (merge into `topics.json` + `manifest.json`):**

```bash
npm run ml-wiki:import-batch -- --after <LAST_PROCESSED_NOTE_ID> --count 10 --pull --deck "Machine Learning by Henrik Nordberg"
```

Use the **Last processed note ID** from the [Import progress](#import-progress-note-ids) table for `<LAST_PROCESSED_NOTE_ID>`. Change `--count` when you want a different window.

- `--after` is **exclusive**: the next imported notes are those with Anki note ID **strictly greater** than this value, in **ascending numeric order**. The deck’s `findNotes` order is not guaranteed; the script sorts.
- `--count` is how many **notes** to take (one wiki topic per note).
- Alternatively, omit `--pull` and pass **`--input path/to/notes.json`** with the same shape as in [Import from an Anki JSON export](#import-from-an-anki-json-export) (handy for CI or when AnkiConnect is not reachable from the shell).

**Multi-batch automation:** `npm run ml-wiki:import-batch-loop -- --iterations 10 --count 10 --pull --deck "Machine Learning by Henrik Nordberg"` runs import → validate → build → README progress update → git commit for each batch. It reads the [Import progress](#import-progress-note-ids) row in Node so shell scripts do not have to parse Markdown backticks in the table.

**After a successful batch:** (1) `npm run ml-wiki:validate` (2) `npm run build` (3) update the **Last processed note ID** row in this README to the **largest** `noteId` in the batch (see [Import progress](#import-progress-note-ids)) (4) if any new topic’s `papers` entry is missing `url` but the work is on arXiv, add **`https://arxiv.org/abs/…`** (the importer only copies URLs present in the note footer) (5) **commit** the changed files, for example `src/app/ml/wiki/content/topics.json`, `src/app/ml/wiki/content/manifest.json`, this `README.md`, and any new assets under `public/` — message along the lines of `ml-wiki: import batch (max noteId …)`.

#### If validate or build fails

Do **not** auto-revert edits. Leave the working tree as-is. Report clearly what completed (e.g. import script exited 0), which command failed, its error output, and which files were touched so you can fix forward or revert by hand.

**Slug and metadata:** If a note has `ml-wiki:<kebab-slug>`, that slug wins. Otherwise the slug is derived from the **Front** field (kebab-case). Optional `ml-domain:*`, `ml-level:*`, and `ml-type:*` tags override inference; otherwise domain/level/type are inferred from ordinary Anki tags (for example `implementation` → `deep-learning`, `landmark` → `history`, `advanced` → `advanced`). Every imported topic gets a `wiki-import` tag.

**`related` (temporary):** Each batch links topics in a small ring **within that batch only** so `npm run ml-wiki:validate` stays green. Revisit when you compute real relatedness across the full deck.

### Cursor agent: “read the readme and process the next set of notes”

“Process the next set” means: **incremental merge** via **`npm run ml-wiki:import-batch`** (10 notes by default). Do **not** use `import-from-notes.mjs` for this workflow.

1. Read **Last processed note ID** and **Deck name** from this file ([Import progress](#import-progress-note-ids) and [Automated batch import](#automated-batch-import-canonical-loop)).
2. Optionally confirm the deck exists (Anki MCP **`get_decks`**, or Anki UI). In Cursor, the Anki MCP server is often **`user-anki-mcp`** (name may vary; use whatever exposes `find_notes` / `get_note`).
3. Optionally use MCP **`find_notes`** with query `deck:"Machine Learning by Henrik Nordberg"` to gauge how many notes remain. IDs in the reply are **note IDs** (for a Basic note type, card ID may match note ID).
4. **Import:** If the shell can reach AnkiConnect, run **`npm run ml-wiki:import-batch`** with `--after` equal to the table’s last processed ID, **`--count 10`** (or another count if the user asked), **`--pull`**, and **`--deck "Machine Learning by Henrik Nordberg"`**. This uses AnkiConnect’s `findNotes` + `notesInfo`; you do not need to paste card HTML into chat. If AnkiConnect is not reachable from the shell, build a temporary `notes.json` (same shape as [Import from an Anki JSON export](#import-from-an-anki-json-export)) using MCP **`get_note`** or an export, then run the same npm script with **`--input path/to/notes.json`** instead of **`--pull`**.
5. **Verify:** `npm run ml-wiki:validate` then `npm run build`. On failure, follow [If validate or build fails](#if-validate-or-build-fails).
6. **Progress + links:** Update the README **Last processed note ID** row to the batch’s maximum `noteId`. Add missing **`https://arxiv.org/abs/…`** URLs on `papers` where needed.
7. **Commit:** After validate and build both succeed, commit the batch (see **After a successful batch** above).

## Translating deck notes into normal wiki pages

Each **note** should become **one ordinary article** at `/ml/wiki/<slug>`, not a flashcard-style page.

Follow these rules when converting HTML backs (or when extending `seed-five-notes.mjs` / `import-anki-batch.mjs`):

1. **No Anki card chrome on the site** — Do not rely on expandable “front/back” rows for the main content. Put the substance in `sections[]` as regular prose (and optional `equation` / `figure` sections). Leave `cards` as **`[]`** so the “Check your understanding” block is hidden; add cards later only if you deliberately want practice prompts separate from the article.
2. **Remove deck separators** — Strip `<hr>` (and any “underline” stand-ins). Use multiple `sections` with real titles instead of horizontal rules between ideas.
3. **One place for bibliography** — If the note ends with a `<small>…</small>` footer (year · authors · title), **remove it from the body** and store a single line in `papers` (for example `{ "citation": "…", "url": "…" }`). Do **not** repeat the same reference in `sections` or `referencesHtml` unless you are adding extra commentary. **arXiv:** whenever the work has an arXiv preprint, set `papers[].url` to the abstract page **`https://arxiv.org/abs/<arxiv-id>`** (canonical, stable). If the deck footer has no link, look up the paper and add that URL during import or in a quick edit pass; only use a non-arXiv `url` when there is no arXiv listing (books, proprietary reports, essays hosted elsewhere).
4. **Strip the Anki wrapper div** — Remove the outer `max-width:680px` deck wrapper; the site layout already constrains width. Centered SVG/diagram blocks can be wrapped in `<div class="wiki-deck-figure-wrap">…</div>` for spacing (see `globals.css`).
5. **Headings as sections** — Turn `<p><b>Mechanism:</b></p>`-style lines into `section.title` + following HTML in `section.body`, so the page reads like a structured article.
6. **Math inside HTML: `<` is not safe in raw TeX** — Topic prose in `sections[].body` is rendered as HTML (see `SectionBlock.tsx`: `dangerouslySetInnerHTML`). MathJax then typesets `\(...\)` and `\[...\]` inside that HTML. The HTML parser runs **first**: any literal **`<`** begins a tag. Subscripts such as `w_{<t}` or `u_{<i}` are therefore parsed as malformed HTML, which **cuts the DOM** in the middle of an equation. Symptoms include raw `\[` / `\]` text on the page and the **following** paragraph fused into the broken math.

   **Authoring fixes (pick one):**

   - Escape the less-than as an HTML entity inside the string: `w_{&lt;t}` (MathJax still sees the intended subscript after entity decode), or
   - Prefer notation without `<` in HTML at all, e.g. prefix form **`w_{1:t-1}`** / **`u_{1:i-1}`** instead of “strictly before index \(t\)” shorthand.

   The same rule applies to TeX inside **SVG `<text>`** nodes, since those strings live in the same HTML document.

   **Angle brackets (TeX `\langle`/`\rangle`) and `<code>`:** MathJax does not typeset `\(...\)` inside `<code>…</code>` by default, so delimiters such as `\(\langle X \rangle\)` show up as literal TeX. For monospace examples (e.g. T5 sentinels), use Unicode **mathematical angle brackets** `⟨` `⟩` (U+27E8 / U+27E9), e.g. `⟨X⟩`, or keep `\langle … \rangle` only in ordinary prose/math **outside** `<code>`.

7. **`cards[].answer` and MathJax** — If you keep the “Check your understanding” block (`cards` non-empty), answers are HTML injected only **after** the user expands a row. The wiki runs an extra MathJax pass on that panel when it opens (`typesetMathInSubtree` from `CardEvidence.tsx`), so `\(...\)` / `\[...\]` in `cards[].answer` is supported. The `<` rules in (6) still apply to card HTML.

The preview script `seed-five-notes.mjs` implements the above for the five lowest note IDs (see below).

## Preview: five lowest note IDs as five wiki pages

The Anki MCP exposes **note** IDs (not separate card IDs). To materialize the five smallest note IDs from “Machine Learning by Henrik Nordberg” as **five separate topics** (one `/ml/wiki/<slug>` per note), HTML backs live under `scripts/ml-wiki/preview-notes/<noteId>-back.html` and:

```bash
npm run ml-wiki:seed-five
```

This removes any prior `five-lowest-note-ids` combined topic and (re)writes topics: `constitutional-classifiers-plus-plus`, `continuous-thought-machines`, `mechanistic-oocr-steering-vectors`, `critical-representation-fine-tuning`, `chain-of-thought-monitorability`. Then `npm run ml-wiki:validate` and `npm run build`. Re-run after refreshing the preview HTML files from a new export.

## Import progress (note IDs)

The pipeline treats **Anki note IDs** as the unit of work (one note → one wiki article). IDs are processed in **strictly increasing numeric order**. After each successful **`npm run ml-wiki:import-batch`** run (or a checked-in manual batch), **update only the line below** to the **maximum note ID merged in that batch**. The next run uses `--after` equal to this value so anything with ID ≤ it is skipped.

| Last processed note ID | Next notes to pull |
| ---: | --- |
| `1772500831042` | Strictly greater than `1772500831042` (sort ascending; take the next window). |

**How to use:** Keep this row in sync with Git whenever you import (commit it with the same batch as `topics.json` / `manifest.json`). Optional offline HTML snapshots under `preview-notes/` are only for the legacy `seed-five-notes.mjs` path; the main bulk path is **`npm run ml-wiki:import-batch`** (`import-anki-batch.mjs`).

## TODO: Related topics from the full deck

**Task (later):** Compute each topic’s **`related`** slugs from how notes actually relate to each other, instead of the current placeholders: `seed-five-notes.mjs` uses a fixed ring over its five preview topics, and `import-anki-batch.mjs` uses a ring **within each imported batch only**.

Do this **after** all relevant deck notes are imported into `topics.json` so the signal is global (shared tags, co-tagged notes, taxonomy overlap, optional text/embeddings similarity, or a hybrid). Emit `related` in a dedicated script or as a final import phase, then keep `npm run ml-wiki:validate` as the guardrail (every `related` entry must resolve to an existing slug).

## Validate locally

```bash
npm run ml-wiki:validate
```

Runs the same integrity checks the app uses at build time (slug set parity, prerequisites/related, path references).

## Routine: arXiv / `papers[]` URL pass (agent- or human-run)

Use this as a **repeatable checklist** (same idea as a short Cursor skill, but kept here so it stays next to the import pipeline). Run after a batch import or whenever outbound links look thin.

1. **Find gaps** — List every `papers[]` object in `topics.json` that has no `url`:

   ```bash
   node -e "const t=require('./src/app/ml/wiki/content/topics.json'); for (const x of t) for (const p of x.papers||[]) if(!p.url) console.log(x.slug+'\t'+p.citation);"
   ```

2. **Decide arXiv vs non-arXiv** — If the work is (or was) posted on arXiv, set **`papers[].url`** to **`https://arxiv.org/abs/<arxiv-id>`** (abstract page, stable). Prefer that over `arxiv.org/pdf/…` for reader UX.

3. **Resolve IDs** — Search [arxiv.org](https://arxiv.org/), use `https://export.arxiv.org/api/query?id_list=…` for metadata, or follow DOI / conference page from the citation. Do **not** guess an ID; confirm title/authors match.

4. **Citation vs link** — The importer often copies a **shortened** deck footer. If the linked arXiv work has a different full title or author list, **update `citation`** to match the linked paper, or keep the deck line and add a short **`note`** on that `papers[]` object explaining the mapping (see `WikiPaperRef` in `types.ts`).

5. **No arXiv listing** — Textbooks, old journal-only articles, OpenAI PDFs, ACL Anthology-only, etc.: use a stable non-arXiv `url` (publisher PDF, DOI `https://doi.org/…`, or ACL Anthology) or leave `url` unset if there is no good open link.

6. **Verify** — `npm run ml-wiki:validate` and `npm run build`.

---

## Keeping the study deck and the wiki in sync

The site is **static**: it does not talk to Anki at build time. Treat **`topics.json`** as the published snapshot of your notes, and use a repeatable export → import → validate loop.

### Principles

1. **One topic slug per wiki page** — every note that belongs to that page carries the same tag: `ml-wiki:<kebab-slug>` (e.g. `ml-wiki:bias-variance-tradeoff`).
2. **Optional taxonomy tags** on notes (import script reads these if present):
   - `ml-domain:supervised` (must match a known domain in `types.ts`)
   - `ml-level:intro`
   - `ml-type:mixed`
3. **Curated fields on the topic** (often edited after import): `prerequisites`, `related`, `paths.json`, and the optional **`historyHtml`**, **`referencesHtml`**, **`papers`** array. These are the “article frame” around raw cards; keep them in Git and merge by hand when imports overwrite `topics.json`. For **`papers`**, prefer a **`url`** on **`https://arxiv.org/abs/…`** for any arXiv-listed publication so readers get a consistent outbound link.
4. **Media** — store assets under `public/` (e.g. `public/ml/wiki/...`) and reference them in `sections[].figure.src` or in HTML bodies.

### Recommended workflow (each sync)

1. **In Anki** — ensure every note you want on the wiki has `ml-wiki:<slug>`. Add taxonomy tags if you use the importer’s shortcuts.
2. **Export** — dump notes to JSON (shape `{ "notes": [ { "noteId", "tags", "fields": { "Front", "Back", ... } } ] }`). AnkiConnect, a small local script, or MCP in Cursor is fine; commit **only** the generated `topics.json`, not a live DB.
3. **Import (merge or replace)**  
   - Quick path: `node scripts/ml-wiki/import-from-notes.mjs path/to/notes.json` **replaces** `topics.json` from grouped notes. Then **re-apply** manual edits (prereqs, related, history, papers) from Git diff or a saved patch.  
   - Safer path: import to a **temp file**, diff against `topics.json`, merge curated fields, then copy into place.
4. **Manifest** — update `manifest.json` `topics` so its slug set matches `topics.json` (order = wiki index order).
5. **Validate** — `npm run ml-wiki:validate` then `npm run build`.

### Mapping note fields → wiki sections

The legacy `import-from-notes.mjs` creates one prose block per note. For production, apply the **“Translating deck notes into normal wiki pages”** rules above: structured `sections[]`, empty `cards[]` unless you want optional drills, and a single `papers` entry when the note had a footer citation.

### When wiki and deck disagree

| Situation | Suggestion |
|-----------|------------|
| You fix a typo in Anki | Re-export and re-import that topic’s notes; preserve curated `papers` / `related` if unchanged. |
| You fix theory only on the wiki | Either copy the fix back into Anki, or accept drift and treat the wiki as canonical for web. |
| You add a new topic | New `ml-wiki:` slug on notes → import → add slug to `manifest.json` and any `paths.json` entries. |

Document your own rule (“Anki wins” vs “wiki wins”) in a one-line comment at the top of `topics.json` or in team notes so future you stays consistent.

---

## Import from an Anki JSON export

1. Export notes to JSON shaped like:

```json
{
  "notes": [
    {
      "noteId": "123",
      "tags": ["ml-wiki:my-topic", "ml-domain:supervised"],
      "fields": { "Front": "Question…", "Back": "Answer…" }
    }
  ]
}
```

2. Tag any note that should belong to a wiki topic with **`ml-wiki:<kebab-slug>`** (example: `ml-wiki:linear-regression-basics`).

3. Run:

```bash
node scripts/ml-wiki/import-from-notes.mjs path/to/notes.json
```

This overwrites `src/app/ml/wiki/content/topics.json`. Then update `manifest.json` `topics` array to list the same slugs (order = wiki index order), and run `npm run ml-wiki:validate`.

## Media

- Copy referenced images into `public/` (e.g. `public/ml/wiki/...`) and point `figure.src` at `/ml/wiki/...`.
- After import, replace placeholder paths and re-run validate + `npm run build`.

## MCP / AnkiConnect

The **site build** does not call Anki. For **authoring**, use either:

- **`npm run ml-wiki:import-batch -- --pull …`** (AnkiConnect on your machine), or  
- The **Anki MCP** in Cursor (`find_notes`, `get_note`, etc.) when you need to inspect or export notes interactively, then **`--input`** for the merge script.

Commit only static `topics.json` / `manifest.json` (and related assets), never a live Anki database. Legacy **`import-from-notes.mjs`** still **replaces** the whole `topics.json` from grouped `ml-wiki:` buckets; prefer **`npm run ml-wiki:import-batch`** for incremental deck slices (“next set” imports).
