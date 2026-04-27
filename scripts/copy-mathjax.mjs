/**
 * Copies the MathJax ES5 bundle from node_modules into public/ for next/script.
 * Runs from postinstall so /mathjax/tex-chtml-full.js exists before dev/build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "node_modules", "mathjax", "es5", "tex-chtml-full.js");
const destDir = path.join(root, "public", "mathjax");
const dest = path.join(destDir, "tex-chtml-full.js");

if (!fs.existsSync(src)) {
  console.error(
    "copy-mathjax: missing node_modules/mathjax/es5/tex-chtml-full.js — run npm install",
  );
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
