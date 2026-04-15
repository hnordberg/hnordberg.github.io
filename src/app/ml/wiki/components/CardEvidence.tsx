"use client";

import { useEffect, useId, useRef, useState } from "react";
import { typesetMathInSubtree } from "../../../components/MathJax";
import type { WikiCard } from "../types";

type CardEvidenceProps = {
  cards: WikiCard[];
};

export function CardEvidence({ cards }: CardEvidenceProps) {
  if (cards.length === 0) return null;
  const baseId = useId();

  return (
    <div className="wiki-cards">
      <h2 className="wiki-section-heading">Check your understanding</h2>
      <p className="wiki-cards-intro">
        Expand each row to compare your recall with the full answer on the page.
      </p>
      <ul className="wiki-cards-list">
        {cards.map((card, i) => (
          <CardRow key={card.noteId} card={card} panelId={`${baseId}-${i}`} />
        ))}
      </ul>
    </div>
  );
}

function CardRow({ card, panelId }: { card: WikiCard; panelId: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    typesetMathInSubtree(panelRef.current);
  }, [open, card.answer]);

  return (
    <li className="wiki-card-item">
      <button
        type="button"
        className="wiki-card-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="wiki-card-prompt">{card.prompt}</span>
        <span className="wiki-card-chevron" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div id={panelId} ref={panelRef} className="wiki-card-panel">
          <div
            className="wiki-card-answer"
            dangerouslySetInnerHTML={{ __html: card.answer }}
          />
          {card.tags.length > 0 ? (
            <div className="wiki-card-tags">
              {card.tags.map((t) => (
                <span key={t} className="wiki-card-tag">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
