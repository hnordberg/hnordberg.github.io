# Henrik Nordberg's Personal Website

This repository contains the source code for Henrik Nordberg's personal website, available at [hnordberg.github.io](https://hnordberg.github.io).

## Technology Stack

The website is built with the following technologies:

*   **Framework:** [Next.js](https://nextjs.org/) (a React framework)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:**
    *   [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
    *   Plain CSS with CSS Variables for theming (dark and light modes).
*   **Deployment:** [GitHub Pages](https://pages.github.com/), deployed via a GitHub Actions workflow.

## MathJax Renderer Toggle

The app supports two MathJax renderers:

- `chtml` (default)
- `svg`

### How To Switch

1. Ensure local MathJax bundles are copied:
   - `npm run mathjax:copy`
2. Set the renderer in `.env.local`:
   - `NEXT_PUBLIC_MATHJAX_RENDERER=chtml` or `NEXT_PUBLIC_MATHJAX_RENDERER=svg`
3. Restart `next dev`.

### Pros And Cons

- `chtml`
  - Pros: More text-like output, often lighter DOM for math-heavy pages.
  - Cons: Requires font assets; if missing, requests like `/mathjax/output/chtml/fonts/...` can 404.
- `svg`
  - Pros: No CHTML font fetches, so it avoids those font 404s.
  - Cons: Can create heavier DOM on pages with many equations and slightly different copy/paste behavior.

### Important Note About Initial Math Not Rendering

Switching renderer does not usually fix "math appears only after refresh" issues by itself. That symptom is typically caused by when/where typesetting runs in the page lifecycle, not by CHTML vs SVG choice.

## MathJax Troubleshooting History

### Incident: Math renders only after refresh

- Symptom: some ML Wiki pages initially showed raw TeX (`\(...\)`, `\[...\]`) until a manual refresh.
- Impact: inconsistent first-load math rendering; difficult to reproduce because timing varied.

### Root Cause We Identified

In `src/app/components/MathJax.tsx`, the MathJax `<script>` could be appended to the document before `load` listeners were attached. On fast/cached loads, this could miss the `load` event and leave readiness unresolved for the current page lifecycle.

### Fix Implemented

- Attach script `load`/`error` listeners before `appendChild`.
- Add immediate "already ready" checks using `window.MathJax?.typesetPromise`.
- For already-connected scripts, re-check readiness and mark as loaded if MathJax is available.

This fix is renderer-agnostic and applies to both `chtml` and `svg`.

### If It Regresses Later

1. Confirm current renderer and restart dev server:
   - Check `.env.local` for `NEXT_PUBLIC_MATHJAX_RENDERER`.
   - Restart `next dev` after changing renderer/env.
2. Confirm local bundles exist:
   - `npm run mathjax:copy`
   - verify `public/mathjax/tex-chtml.js` and `public/mathjax/tex-svg.js` are present.
3. Test a direct first load of a math-heavy wiki page (hard refresh), then client-side navigate to another math-heavy page.
4. If still broken, inspect `src/app/components/MathJax.tsx` first; this file owns script readiness and typeset timing.
5. Add temporary console diagnostics around:
   - script creation/append
   - script `load`/`error`
   - `ensureMathJaxReady` resolve/reject
   - each `typesetMathInSubtree` call site

### Follow-up Regression (after renderer toggle)

- Symptom: no math rendered at all after switching to `tex-chtml.js`.
- Observed runtime failure: `GET /mathjax/sre/speech-worker.js 404`.
- Cause: required MathJax runtime assets were not being copied to `public/mathjax`.
- Fix:
  - `scripts/copy-mathjax.mjs` now copies:
    - `node_modules/mathjax/sre/**` -> `public/mathjax/sre/**`
    - `node_modules/@mathjax/mathjax-newcm-font/chtml/woff2/**` -> `public/mathjax/output/chtml/fonts/woff2/**` (when present)
  - `ensureMathJaxReady` now clears its cached promise on rejection so future calls can retry after transient failures.

## License

The structure of this website repository is licensed under the MIT License.
The content of the ML Wiki section of the website is licensed under the CC BY-NC-ND 4.0 License.
You are free to create a personal website using this repo, but don't include the ML Wiki content in your website.
See the [LICENSE](LICENSE) file for details.