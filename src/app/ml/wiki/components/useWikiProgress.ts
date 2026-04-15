import { useState, useEffect, useCallback } from "react";

export function useWikiProgress() {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wiki-progress");
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          setCompletedSlugs(new Set(arr));
        }
      }
    } catch (e) {
      // ignore parsing errors
    }
  }, []);

  const markCompleted = useCallback((slug: string) => {
    setCompletedSlugs((prev) => {
      const next = new Set(prev);
      next.add(slug);
      try {
        localStorage.setItem("wiki-progress", JSON.stringify([...next]));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const isCompleted = useCallback((slug: string) => {
    return completedSlugs.has(slug);
  }, [completedSlugs]);

  return { completedSlugs, markCompleted, isCompleted };
}
