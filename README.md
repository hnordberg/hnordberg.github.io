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

## License

The structure of this website repository is licensed under the MIT License.
The content of the ML Wiki section of the website is licensed under the CC BY-NC-ND 4.0 License.
You are free to create a personal website using this repo, but don't include the ML Wiki content in your website.
See the [LICENSE](LICENSE) file for details.