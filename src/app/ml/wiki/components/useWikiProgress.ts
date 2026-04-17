"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useAuth } from "../../../lib/AuthContext";
import { db } from "../../../lib/firebase";

export type PathProgress = {
  status: "not-started" | "in-progress" | "completed";
  startedAt: number | null;
  completedSlugs: string[];
};

export function useWikiProgress() {
  const { user } = useAuth();
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [learningPaths, setLearningPaths] = useState<Record<string, PathProgress>>({});

  useEffect(() => {
    if (!user) {
      setCompletedSlugs(new Set());
      setLearningPaths({});
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.globalCompletedSlugs) {
          setCompletedSlugs(new Set(data.globalCompletedSlugs));
        }
        if (data.learningPaths) {
          setLearningPaths(data.learningPaths);
        }
      }
    });

    return () => unsub();
  }, [user]);

  const markCompleted = useCallback((slug: string) => {
    setCompletedSlugs((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      
      if (user) {
        setDoc(doc(db, "users", user.uid), {
          globalCompletedSlugs: [...next],
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch((err) => {
          console.error("Failed to sync global progress", err);
        });
      }
      return next;
    });
  }, [user]);

  const isCompleted = useCallback((slug: string) => {
    return completedSlugs.has(slug);
  }, [completedSlugs]);

  const updatePathProgress = useCallback((pathSlug: string, updates: Partial<PathProgress>) => {
    if (!user) return;
    setLearningPaths((prev) => {
      const current = prev[pathSlug] || { status: "not-started", startedAt: null, completedSlugs: [] };
      const nextPath = { ...current, ...updates };
      const next = { ...prev, [pathSlug]: nextPath };

      setDoc(doc(db, "users", user.uid), {
        learningPaths: next,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);

      return next;
    });
  }, [user]);

  const markPathTopicCompleted = useCallback((pathSlug: string, topicSlug: string) => {
     if (!user) return;
     setLearningPaths((prev) => {
        const current = prev[pathSlug] || { status: "in-progress", startedAt: Date.now(), completedSlugs: [] };
        if (current.completedSlugs.includes(topicSlug)) return prev;
        
        const nextPath = {
          ...current,
          completedSlugs: [...current.completedSlugs, topicSlug]
        };
        const next = { ...prev, [pathSlug]: nextPath };

        setDoc(doc(db, "users", user.uid), {
          learningPaths: next,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(console.error);

        // Ensure global is also updated implicitly
        markCompleted(topicSlug);

        return next;
     });
  }, [user, markCompleted]);

  return { 
    completedSlugs, 
    markCompleted, 
    isCompleted,
    learningPaths,
    updatePathProgress,
    markPathTopicCompleted
  };
}
