"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

type Props = {
  siteKey: string;
  submitUrl: string | null;
  initialTopic?: string;
  initialNotes?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export default function WikiTopicSuggestForm({ siteKey, submitUrl, initialTopic = "", initialNotes = "", onSuccess, onCancel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [topic, setTopic] = useState(initialTopic);
  const [notes, setNotes] = useState(initialNotes);
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    let cancelled = false;

    function mount() {
      if (cancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(null),
        "error-callback": () => setToken(null),
      });
    }

    function waitTurnstile(cb: () => void) {
      const deadline = Date.now() + 15000;
      const tick = () => {
        if (cancelled) {
          return;
        }
        if (window.turnstile) {
          cb();
          return;
        }
        if (Date.now() > deadline) {
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    }

    if (window.turnstile) {
      mount();
    } else if (
      document.querySelector('script[src*="turnstile/v0/api.js"]')
    ) {
      waitTurnstile(mount);
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => waitTurnstile(mount);
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!submitUrl) {
      setErrorMessage(
        "The suggestion endpoint is not configured (set NEXT_PUBLIC_WIKI_SUGGEST_URL in the build)."
      );
      setStatus("error");
      return;
    }
    if (!token) {
      setErrorMessage("Complete the verification challenge first.");
      setStatus("error");
      return;
    }
    if (!topic.trim()) {
      setErrorMessage("Enter a topic title or short description.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          topic: topic.trim(),
          notes: notes.trim(),
          contact: contact.trim(),
        }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Request failed"
        );
      }
      setTopic("");
      setNotes("");
      setContact("");
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setToken(null);
      setStatus("ok");
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  if (!siteKey) {
    return (
      <p className="wiki-muted">
        Turnstile is not configured (missing{" "}
        <code className="wiki-code-inline">CLOUDFLARE_SITE_KEY</code> at build
        time).
      </p>
    );
  }

  return (
    <form className="wiki-suggest-form" onSubmit={onSubmit}>
      <label className="wiki-suggest-label">
        Topic or concept
        <input
          className="wiki-suggest-input"
          type="text"
          name="topic"
          autoComplete="off"
          required
          maxLength={300}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. spectral normalization for GANs"
        />
      </label>

      <label className="wiki-suggest-label">
        Notes (optional)
        <textarea
          className="wiki-suggest-textarea"
          name="notes"
          rows={6}
          maxLength={8000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why it belongs in the wiki, links to papers, or how it connects to existing topics."
        />
      </label>

      <label className="wiki-suggest-label">
        Contact (optional)
        <input
          className="wiki-suggest-input"
          type="text"
          name="contact"
          autoComplete="email"
          maxLength={200}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or handle if you want a reply"
        />
      </label>

      <div className="cf-turnstile-footer">
        <div ref={containerRef} />
      </div>

      {!submitUrl && (
        <p className="wiki-muted" role="status">
          Submissions are disabled until{" "}
          <code className="wiki-code-inline">NEXT_PUBLIC_WIKI_SUGGEST_URL</code>{" "}
          points at a server that verifies Turnstile (see{" "}
          <code className="wiki-code-inline">workers/wiki-topic-suggest</code>{" "}
          in this repository).
        </p>
      )}

      {errorMessage && (
        <p className="wiki-suggest-error" role="alert">
          {errorMessage}
        </p>
      )}

      {status === "ok" && (
        <p className="wiki-suggest-success" role="status">
          Thanks — your suggestion was received.
        </p>
      )}

      <div className="wiki-suggest-actions" style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="submit"
          className="wiki-topic-nav-btn"
          disabled={status === "sending" || !submitUrl}
        >
          {status === "sending" ? "Sending…" : "Send suggestion"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="wiki-topic-nav-btn wiki-topic-nav-btn--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        {status === "ok" && (
          <button
            type="button"
            className="wiki-topic-nav-btn wiki-topic-nav-btn--ghost"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
            }}
          >
            Suggest another
          </button>
        )}
      </div>
    </form>
  );
}
