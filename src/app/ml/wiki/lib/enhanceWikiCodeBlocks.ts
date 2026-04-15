import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

let registered = false;

function ensureLanguages(): void {
  if (registered) return;
  registered = true;
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("yaml", yaml);
  hljs.registerLanguage("rust", rust);
  hljs.registerLanguage("cpp", cpp);
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("go", go);
  hljs.registerLanguage("sql", sql);
}

const SUMMARY_ALIASES: Record<string, string> = {
  python: "python",
  py: "python",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  bash: "bash",
  shell: "bash",
  sh: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  java: "java",
  cpp: "cpp",
  "c++": "cpp",
  sql: "sql",
  css: "css",
  html: "xml",
  xml: "xml",
  svg: "xml",
};

function languageFromSummary(summary: string): string | undefined {
  const key = summary.trim().toLowerCase();
  const mapped = SUMMARY_ALIASES[key];
  if (mapped && hljs.getLanguage(mapped)) return mapped;
  if (hljs.getLanguage(key)) return key;
  return undefined;
}

function languageFromCodeClass(code: HTMLElement): string | undefined {
  for (const cls of code.classList) {
    const m = /^language-([\w-]+)$/.exec(cls);
    if (m?.[1] && hljs.getLanguage(m[1])) return m[1];
  }
  return undefined;
}

function resolveLanguage(pre: HTMLPreElement, code: HTMLElement): string {
  const details = pre.closest("details");
  if (details) {
    const summary = details.querySelector("summary");
    const text = summary?.textContent;
    if (text) {
      const fromSummary = languageFromSummary(text);
      if (fromSummary) return fromSummary;
    }
  }
  return languageFromCodeClass(code) ?? "plaintext";
}

async function copyCode(text: string, button: HTMLButtonElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  } catch {
    button.textContent = "Failed";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  }
}

/**
 * Wraps each `pre > code` in section HTML with a toolbar (copy) and runs highlight.js.
 * Idempotent: skips `pre` already inside `.wiki-code-panel`.
 */
export function enhanceWikiCodeBlocks(root: HTMLElement): void {
  ensureLanguages();

  const pres = root.querySelectorAll<HTMLPreElement>("pre");
  for (const pre of pres) {
    if (pre.closest(".wiki-code-panel")) continue;
    const code = pre.querySelector("code");
    if (!code) continue;

    const panel = document.createElement("div");
    panel.className = "wiki-code-panel";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "wiki-code-copy";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy code to clipboard");

    const parent = pre.parentNode;
    if (!parent) continue;

    parent.insertBefore(panel, pre);
    panel.appendChild(copyBtn);
    panel.appendChild(pre);

    const lang = resolveLanguage(pre, code);
    code.removeAttribute("class");
    code.classList.add("hljs", `language-${lang}`);

    try {
      hljs.highlightElement(code as HTMLElement);
    } catch {
      const raw = code.textContent ?? "";
      const { value } = hljs.highlight(raw, { language: "plaintext", ignoreIllegals: true });
      code.innerHTML = value;
    }

    copyBtn.addEventListener("click", () => {
      void copyCode(code.textContent ?? "", copyBtn);
    });
  }
}
