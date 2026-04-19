"use client";

import { useEffect, useRef } from "react";
import WikiTopicSuggestForm from "../../../suggest-topic/WikiTopicSuggestForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  siteKey: string;
  submitUrl: string | null;
  topicSlug: string;
  topicTitle: string;
};

export function ReportIssueModal({
  isOpen,
  onClose,
  siteKey,
  submitUrl,
  topicSlug,
  topicTitle,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="card"
      style={{
        padding: "2rem",
        maxWidth: "500px",
        width: "90vw",
        border: "1px solid var(--color-base-200)",
        borderRadius: "8px",
        backgroundColor: "var(--card-background-light)",
        color: "inherit",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" }}>
        Report Error in Card
      </h2>
      <p style={{ opacity: 0.8, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        If this card contains factually incorrect information, typos, or rendering issues, please let us know.
      </p>
      {isOpen && (
        <WikiTopicSuggestForm
          siteKey={siteKey}
          submitUrl={submitUrl}
          initialTopic={`Issue with card: ${topicTitle}`}
          initialNotes={`Card slug: ${topicSlug}\n\nDescribe the error: `}
          onSuccess={() => {
            // Give them a moment to read the success message before closing automatically
            setTimeout(() => onClose(), 2500);
          }}
          onCancel={onClose}
        />
      )}
    </dialog>
  );
}
