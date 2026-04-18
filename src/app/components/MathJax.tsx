"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactElement,
  type RefObject,
} from "react";

const MATHJAX_SRC =
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

type MathJaxGlobal = {
  version?: string;
  typesetPromise?: (nodes: HTMLElement[]) => Promise<unknown>;
  /** Removes rendered math under nodes so React-updated DOM can be typeset again without stale offsets. */
  typesetClear?: (nodes: HTMLElement[]) => void;
  tex?: typeof defaultMathJaxConfig.tex;
  svg?: typeof defaultMathJaxConfig.svg;
  startup?: {
    promise?: Promise<unknown>;
    typeset?: boolean;
  };
};

type MathJaxWindow = Window & {
  MathJax?: MathJaxGlobal;
};

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
  const w = window as MathJaxWindow;
  if (w.MathJax?.version) return;
  w.MathJax = {
    ...defaultMathJaxConfig,
    ...config,
    tex: { ...defaultMathJaxConfig.tex, ...(config.tex ?? {}) },
    svg: { ...defaultMathJaxConfig.svg, ...(config.svg ?? {}) },
    startup: { ...defaultMathJaxConfig.startup, ...(config.startup ?? {}) },
  };
}

/**
 * Clear previous MathJax output under `roots`, then typeset. Clearing is required
 * whenever React replaces or mutates text under a subtree that was already
 * typeset — otherwise MathJax may call `splitText` at stale offsets
 * (`IndexSizeError`).
 */
function typesetAfterClear(
  mj: MathJaxGlobal,
  roots: HTMLElement[],
  onError?: (err: unknown) => void
): void {
  const nodes = roots.filter(Boolean);
  if (nodes.length === 0 || !mj.typesetPromise) return;
  if (typeof mj.typesetClear === "function") {
    mj.typesetClear(nodes);
  }
  void mj.typesetPromise(nodes).catch((err: unknown) => {
    if (onError) onError(err);
    else console.error("MathJax typeset error:", err);
  });
}

/**
 * Typeset TeX delimiters inside `root` only. Does not use the one-shot guard in
 * {@link useMathJax}, so it is safe to call when new HTML (e.g. a collapsible
 * answer) mounts after the initial article pass.
 */
export function typesetMathInSubtree(root: HTMLElement | null): void {
  if (typeof window === "undefined" || !root) return;
  const w = window as MathJaxWindow;
  const run = () => {
    const mj = w.MathJax;
    if (!mj?.typesetPromise) return;
    typesetAfterClear(mj, [root]);
  };
  const mj = w.MathJax;
  if (mj?.typesetPromise) {
    if (mj.startup?.promise) void mj.startup.promise.then(run);
    else run();
    return;
  }
  const id = window.setInterval(() => {
    if (w.MathJax?.typesetPromise) {
      window.clearInterval(id);
      const mj2 = w.MathJax;
      if (mj2?.startup?.promise) void mj2.startup.promise.then(run);
      else run();
    }
  }, 100);
  window.setTimeout(() => window.clearInterval(id), 5000);
}

function typeset(
  containerRef: RefObject<HTMLElement | null>,
  hasRenderedRef: MutableRefObject<boolean>
): void {
  if (hasRenderedRef.current) return;
  const MathJax = (window as MathJaxWindow).MathJax;
  if (!MathJax?.typesetPromise || !containerRef.current) return;
  hasRenderedRef.current = true;
  typesetAfterClear(MathJax, [containerRef.current], (err: unknown) => {
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
): { MathJaxScript: () => ReactElement } {
  configureMathJax();

  const hasRenderedRef = useRef(false);

  const doTypeset = useCallback(() => {
    typeset(containerRef, hasRenderedRef);
  }, [containerRef]);

  useEffect(() => {
    const tryTypeset = () => {
      if (hasRenderedRef.current) return true;
      const MathJax = (window as MathJaxWindow).MathJax;
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
    const MathJax = (window as MathJaxWindow).MathJax;
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
