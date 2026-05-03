"use client";

import { useAuth } from "../../../lib/AuthContext";
import { useWikiProgress } from "./useWikiProgress";

type CustomPathToggleProps = {
  slug: string;
  variant?: "compact" | "prominent";
};

export function CustomPathToggle({ slug, variant = "compact" }: CustomPathToggleProps) {
  const { user } = useAuth();
  const { inCustomPath, toggleCustomPath } = useWikiProgress();
  const checked = inCustomPath(slug);
  const disabled = !user;

  if (variant === "prominent") {
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        onClick={() => toggleCustomPath(slug)}
        className="wiki-topic-nav-btn"
        style={{
          padding: "0.5rem 1rem",
          height: "auto",
          fontSize: "0.9rem",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          backgroundColor: checked ? "var(--color-primary-500)" : undefined,
          color: checked ? "white" : undefined,
          borderColor: checked ? "var(--color-primary-500)" : undefined,
        }}
      >
        {checked ? "✓ In my path" : "+ Add to my path"}
      </button>
    );
  }

  // compact
  return (
    <label
      className="wiki-custom-path-toggle"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.8rem",
        color: "var(--color-base-500)",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => toggleCustomPath(slug)}
        onClick={(e) => e.stopPropagation()}
        aria-label={checked ? "Remove from my path" : "Add to my path"}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      />
      <span>My path</span>
    </label>
  );
}
