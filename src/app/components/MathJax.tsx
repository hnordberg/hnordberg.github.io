"use client";

import {
  useEffect,
  type ReactElement,
  type RefObject,
} from "react";

/**
 * Served from `public/mathjax/` (copied from the `mathjax` npm package).
 * Toggle renderer with `NEXT_PUBLIC_MATHJAX_RENDERER=chtml|svg` (default: chtml).
 */
type MathJaxRenderer = "chtml" | "svg";

const configuredRenderer = process.env.NEXT_PUBLIC_MATHJAX_RENDERER;
const DEFAULT_MATHJAX_RENDERER: MathJaxRenderer =
  configuredRenderer === "svg" ? "svg" : "chtml";
let activeMathJaxRenderer: MathJaxRenderer = DEFAULT_MATHJAX_RENDERER;
let hasAttemptedSvgFallback = false;

const TYPESET_TIMEOUT_MS = 3000;

function mathJaxSrcFor(renderer: MathJaxRenderer): string {
  return renderer === "svg" ? "/mathjax/tex-svg.js" : "/mathjax/tex-chtml.js";
}

function createTimeoutError(ms: number): Error {
  return new Error(`MathJax typeset timed out after ${ms}ms`);
}

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
  svg: {
    fontCache: "global" as const,
    // Prevent aggressive inline wrapping that can split equations into stacked fragments.
    linebreaks: { inline: false, width: "100%" },
  },
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
 * Module-level singleton: resolves once the MathJax bundle has loaded and its
 * startup has finished, so callers can `await` a deterministic "ready" signal
 * instead of polling. Created lazily on first use.
 */
let mathJaxReadyPromise: Promise<MathJaxGlobal> | null = null;

function resetMathJaxRuntime(nextRenderer: MathJaxRenderer): void {
  if (typeof window === "undefined") return;
  const script = document.querySelector<HTMLScriptElement>(
    'script[data-mathjax-loader="true"]'
  );
  if (script?.parentNode) {
    script.parentNode.removeChild(script);
  }
  const w = window as MathJaxWindow;
  delete w.MathJax;
  mathJaxReadyPromise = null;
  activeMathJaxRenderer = nextRenderer;
}

async function typesetWithTimeout(
  mj: MathJaxGlobal,
  nodes: HTMLElement[]
): Promise<void> {
  if (typeof mj.typesetPromise !== "function") return;
  await Promise.race([
    mj.typesetPromise(nodes),
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(createTimeoutError(TYPESET_TIMEOUT_MS)), TYPESET_TIMEOUT_MS)
    ),
  ]);
}

function ensureMathJaxReady(): Promise<MathJaxGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("MathJax cannot load during SSR"));
  }
  if (mathJaxReadyPromise) return mathJaxReadyPromise;

  const createdPromise = new Promise<MathJaxGlobal>((resolve, reject) => {
    configureMathJax();
    const scriptSrc = mathJaxSrcFor(activeMathJaxRenderer);

    const finishWhenStartupDone = () => {
      const mj = (window as MathJaxWindow).MathJax;
      if (!mj) {
        reject(new Error("MathJax global missing after script load"));
        return;
      }
      if (mj.startup?.promise) {
        mj.startup.promise
          .then(() => resolve(mj))
          .catch((err: unknown) => reject(err instanceof Error ? err : new Error(String(err))));
        return;
      }
      if (typeof mj.typesetPromise === "function") {
        resolve(mj);
        return;
      }
      reject(new Error("MathJax loaded but typesetPromise is unavailable"));
    };

    /** MathJax might already be present if another component finished `ensureMathJaxReady` earlier in the session. */
    const existingGlobal = (window as MathJaxWindow).MathJax;
    if (existingGlobal?.typesetPromise) {
      finishWhenStartupDone();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-mathjax-loader="true"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.dataset.mathjaxLoader = "true";
    }

    // If MathJax is already ready (e.g. script executed before we subscribed), resolve immediately.
    const existingNow = (window as MathJaxWindow).MathJax;
    if (existingNow?.typesetPromise) {
      script.dataset.mathjaxLoaded = "true";
      finishWhenStartupDone();
      return;
    }

    if (script.dataset.mathjaxLoaded === "true") {
      finishWhenStartupDone();
      return;
    }

    const onLoad = () => {
      script!.dataset.mathjaxLoaded = "true";
      finishWhenStartupDone();
    };
    const onError = () =>
      reject(
        new Error(
          `Failed to load ${scriptSrc} (renderer=${activeMathJaxRenderer})`
        )
      );

    // Register listeners before append to avoid missing fast/cached `load` events.
    script.addEventListener(
      "load",
      onLoad,
      { once: true }
    );
    script.addEventListener(
      "error",
      onError,
      { once: true }
    );
    if (!script.isConnected) {
      document.head.appendChild(script);
    } else {
      // Existing script can already be loaded but missing our marker.
      const alreadyReady = (window as MathJaxWindow).MathJax;
      if (alreadyReady?.typesetPromise) {
        script.dataset.mathjaxLoaded = "true";
        finishWhenStartupDone();
      }
    }
  });
  mathJaxReadyPromise = createdPromise.catch((err: unknown) => {
    // Allow a future call to retry after transient load failures.
    mathJaxReadyPromise = null;
    throw err instanceof Error ? err : new Error(String(err));
  });

  return mathJaxReadyPromise;
}

/**
 * Typeset TeX delimiters inside `root` once MathJax is ready.
 *
 * Fire-and-forget: errors are logged. If `root` is detached from the document
 * before MathJax finishes loading, the call is skipped silently.
 *
 * Replaces an earlier polling-based implementation that raced on cold loads
 * (the bug where math stayed as raw `\( ... \)` until the user refreshed).
 * The single shared `ensureMathJaxReady` promise removes the race entirely.
 */
export function typesetMathInSubtree(root: HTMLElement | null): void {
  if (!root || typeof window === "undefined") return;
  ensureMathJaxReady()
    .then(async (mj) => {
      if (!root.isConnected) return;
      if (typeof mj.typesetClear === "function") {
        mj.typesetClear([root]);
      }
      await typesetWithTimeout(mj, [root]);
    })
    .catch(async (err: unknown) => {
      // SVG can stall in some environments; transparently fall back to CHTML once.
      if (activeMathJaxRenderer === "svg" && !hasAttemptedSvgFallback) {
        hasAttemptedSvgFallback = true;
        console.warn(
          "MathJax SVG typeset stalled; falling back to CHTML renderer.",
          err
        );
        try {
          resetMathJaxRuntime("chtml");
          const fallbackMj = await ensureMathJaxReady();
          if (!root.isConnected) return;
          if (typeof fallbackMj.typesetClear === "function") {
            fallbackMj.typesetClear([root]);
          }
          await typesetWithTimeout(fallbackMj, [root]);
          return;
        } catch (fallbackErr: unknown) {
          console.error("MathJax fallback-to-CHTML failed:", fallbackErr);
        }
      }
      console.error("MathJax load/typeset error:", err);
    })
}

/** Backwards-compatible no-op component returned by {@link useMathJax}. */
function NoopMathJaxScript(): ReactElement | null {
  return null;
}

/**
 * Hook that typesets `containerRef.current` once MathJax is ready.
 *
 * Returns `{ MathJaxScript }` for backwards compatibility — older call sites
 * embedded `<MathJaxScript />` in their JSX to materialise the loader script.
 * Script injection is now handled inside {@link ensureMathJaxReady}, so the
 * returned component renders `null` and can be left in or removed safely.
 *
 * @example
 *   const mathRef = useRef<HTMLDivElement>(null);
 *   useMathJax(mathRef);
 *   return <div ref={mathRef}>Inline: $x^2$ and display: $$E=mc^2$$</div>;
 */
export function useMathJax(
  containerRef: RefObject<HTMLElement | null>
): { MathJaxScript: () => ReactElement | null } {
  useEffect(() => {
    typesetMathInSubtree(containerRef.current);
  }, [containerRef]);

  return { MathJaxScript: NoopMathJaxScript };
}
