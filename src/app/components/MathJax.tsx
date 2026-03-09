"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";

const MATHJAX_SRC =
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

export const defaultMathJaxConfig = {
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
    tags: "ams" as const,
  },
  svg: { fontCache: "global" as const },
  startup: { typeset: false },
};

/**
 * Configures MathJax on window. Idempotent — safe to call multiple times.
 * Call before the MathJax script loads so the config is in place.
 */
export function configureMathJax(
  config: Partial<typeof defaultMathJaxConfig> = {}
): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { MathJax?: { version?: string }; [k: string]: unknown };
  if (w.MathJax?.version) return;
  w.MathJax = {
    ...defaultMathJaxConfig,
    ...config,
    tex: { ...defaultMathJaxConfig.tex, ...(config.tex ?? {}) },
    svg: { ...defaultMathJaxConfig.svg, ...(config.svg ?? {}) },
    startup: { ...defaultMathJaxConfig.startup, ...(config.startup ?? {}) },
  };
}

function typeset(
  containerRef: RefObject<HTMLElement | null>,
  hasRenderedRef: MutableRefObject<boolean>
): void {
  if (hasRenderedRef.current) return;
  const MathJax = (window as Window & { MathJax?: { typesetPromise?: (nodes: HTMLElement[]) => Promise<unknown> } }).MathJax;
  if (!MathJax?.typesetPromise || !containerRef.current) return;
  hasRenderedRef.current = true;
  MathJax.typesetPromise([containerRef.current]).catch((err: unknown) => {
    hasRenderedRef.current = false;
    console.error("MathJax typeset error:", err);
  });
}

/**
 * Hook to load MathJax and typeset a container once it and the script are ready.
 * Returns a component that renders the MathJax script; render it and pass the
 * same ref to the element that contains LaTeX (e.g. $...$ or $$...$$).
 *
 * @example
 *   const mathRef = useRef<HTMLDivElement>(null);
 *   const { MathJaxScript } = useMathJax(mathRef);
 *   return (
 *     <>
 *       <MathJaxScript />
 *       <div ref={mathRef}>Inline: $x^2$ and display: $$E=mc^2$$</div>
 *     </>
 *   );
 */
export function useMathJax(
  containerRef: RefObject<HTMLElement | null>
): { MathJaxScript: () => JSX.Element } {
  configureMathJax();

  const hasRenderedRef = useRef(false);

  const doTypeset = useCallback(() => {
    typeset(containerRef, hasRenderedRef);
  }, [containerRef]);

  useEffect(() => {
    const tryTypeset = () => {
      if (hasRenderedRef.current) return true;
      const MathJax = (window as Window & { MathJax?: { typesetPromise?: (nodes: HTMLElement[]) => Promise<unknown> } }).MathJax;
      if (!MathJax?.typesetPromise || !containerRef.current) return false;
      doTypeset();
      return true;
    };
    if (tryTypeset()) return;
    const id = setInterval(() => {
      if (tryTypeset()) clearInterval(id);
    }, 200);
    const timeout = setTimeout(() => {
      tryTypeset();
      clearInterval(id);
    }, 5000);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [containerRef, doTypeset]);

  const handleScriptLoad = useCallback(() => {
    if (hasRenderedRef.current) return;
    const MathJax = (window as Window & {
      MathJax?: {
        typesetPromise?: (nodes: HTMLElement[]) => Promise<unknown>;
        startup?: { promise?: Promise<unknown> };
      };
    }).MathJax;
    if (!MathJax || !containerRef.current) return;
    const run = () => doTypeset();
    if (MathJax.startup?.promise) {
      MathJax.startup.promise.then(run);
    } else if (typeof MathJax.typesetPromise === "function") {
      run();
    }
  }, [containerRef, doTypeset]);

  const MathJaxScript = useMemo(
    () =>
      function MathJaxScript() {
        return (
          <Script
            src={MATHJAX_SRC}
            strategy="lazyOnload"
            onLoad={handleScriptLoad}
          />
        );
      },
    [handleScriptLoad]
  );

  return { MathJaxScript };
}
