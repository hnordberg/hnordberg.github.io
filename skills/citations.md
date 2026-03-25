# Looking up citation counts for papers

Use this when updating `citations` in `data/interesting_papers.json`, `data/llm_breakthroughs.json`, or similar.

## Why numbers differ or look “wrong”

- **Stale JSON:** A field left at `0` is often a placeholder, not a measured count.
- **Different sources:** OpenAlex, Semantic Scholar, Google Scholar, and Crossref use different corpora and update cadences; counts rarely match exactly.
- **Preprints:** arXiv versions share one DOI (`10.48550/arXiv.XXXX.YYYYY`); citation counts usually aggregate that work, not per-version.

## Recommended: OpenAlex (no API key)

[OpenAlex](https://openalex.org/) exposes a free JSON API. For a work, read **`cited_by_count`**.

**By DOI** (best when you have it; arXiv DataCite DOIs work):

```bash
curl -sS "https://api.openalex.org/works/https://doi.org/10.48550/arXiv.2408.10205?mailto=YOUR_EMAIL" \
  | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).cited_by_count));"
```

Replace `YOUR_EMAIL` with a real address so requests go to the [polite pool](https://docs.openalex.org/how-to-api/rate-limits-and-authentication#the-polite-pool) (higher, more stable limits).

**By arXiv abstract URL** (OpenAlex can resolve some IDs):

```bash
curl -sS "https://api.openalex.org/works/https://arxiv.org/abs/2408.10205?mailto=YOUR_EMAIL"
```

If lookup fails, open the work in the browser UI and copy the **OpenAlex ID** or **DOI** from the record, then query that URL under `/works/`.

## Alternative: Semantic Scholar Graph API

Endpoint shape: `https://api.semanticscholar.org/graph/v1/paper/{id}?fields=citationCount,title`

`{id}` can be a Semantic Scholar corpus ID, `DOI:...`, `ARXIV:2408.10205`, etc. See their [documentation](https://api.semanticscholar.org/api-docs/).

Unauthenticated traffic is rate-limited; you may get `429`. For repeated or batch updates, [request an API key](https://www.semanticscholar.org/product/api).

## Crossref

Crossref’s work JSON includes `is-referenced-by-count` for some DOIs, but coverage and meaning vary. OpenAlex is usually simpler for a single “how many citations” number.

## Google Scholar

There is **no supported public API**. Use the site manually if you need a Scholar-specific number; do not scrape it from automation (ToS and fragility).

## After you fetch a count

1. Paste the integer into the JSON `citations` field for that entry.
2. Optionally add a short comment in git commit message, e.g. “citations from OpenAlex (date)”, since the number will go stale.

## This repository

- Interesting papers: `data/interesting_papers.json`
- LLM timeline: `data/llm_breakthroughs.json`

Keep using one source consistently (here: **OpenAlex `cited_by_count`**) unless you document a deliberate switch.
