/**
 * Copies MathJax bundles from node_modules into public/ for client-side loading.
 * Keeps both renderers available:
 * - /mathjax/tex-chtml.js
 * - /mathjax/tex-svg.js
 * Also copies runtime assets required by the browser bundles:
 * - /mathjax/sre/**
 * - /mathjax/output/chtml/fonts/woff2/**
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const destDir = path.join(root, "public", "mathjax");
const bundles = ["tex-chtml.js", "tex-svg.js"];
// Both are hard dependencies: sre ships with mathjax, and mathjax itself depends
// on @mathjax/mathjax-newcm-font, so a missing directory means a broken install.
const requiredDirectories = [
  { src: path.join(root, "node_modules", "mathjax", "sre"), dest: path.join(destDir, "sre") },
  {
    src: path.join(root, "node_modules", "@mathjax", "mathjax-newcm-font", "chtml", "woff2"),
    dest: path.join(destDir, "output", "chtml", "fonts", "woff2"),
  },
];

for (const bundle of bundles) {
  const src = path.join(root, "node_modules", "mathjax", bundle);
  if (!fs.existsSync(src)) {
    console.error(
      `copy-mathjax: missing node_modules/mathjax/${bundle} - run npm install`,
    );
    process.exit(1);
  }
}
for (const dir of requiredDirectories) {
  if (!fs.existsSync(dir.src)) {
    console.error(`copy-mathjax: missing ${path.relative(root, dir.src)} - run npm install`);
    process.exit(1);
  }
}

fs.mkdirSync(destDir, { recursive: true });
for (const bundle of bundles) {
  const src = path.join(root, "node_modules", "mathjax", bundle);
  const dest = path.join(destDir, bundle);
  fs.copyFileSync(src, dest);
}
for (const dir of requiredDirectories) {
  fs.cpSync(dir.src, dir.dest, { recursive: true });
}
