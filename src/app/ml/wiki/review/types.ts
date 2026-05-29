import type { WikiTopic } from "../types";
import type { ReviewStatus } from "../content/review/reviewStatus";

export type JsonPatchOpKind = "add" | "remove" | "replace" | "move" | "copy" | "test";

export type JsonPatchOp = {
  op: JsonPatchOpKind;
  path: string;
  value?: unknown;
  from?: string;
  reason?: string;
};

export type ReviewSeverity = "reject" | "warn" | "none";

export type RuleFinding = {
  rule: string;
  severity: ReviewSeverity;
  field: string;
  finding: string;
  proposedFix?: string;
};

export type TopicReviewEntry = {
  slug: string;
  title: string;
  reviewStatus: ReviewStatus;
  severity: ReviewSeverity;
  ruleFindings: RuleFinding[];
  original: WikiTopic;
  proposed: WikiTopic;
  jsonPatch: JsonPatchOp[];
  changeSummary: string[];
};

export type Decision =
  | { kind: "pending" }
  | { kind: "accepted" }
  | { kind: "edited"; raw: string }
  | { kind: "rejected" };

export type DecisionKind = Decision["kind"];

export type AcceptedTopicEntry = {
  slug: string;
  acceptedPatches: JsonPatchOp[];
  rejectedPatches: JsonPatchOp[];
};

export type AcceptedDecisionsFile = {
  version: 1;
  updatedAt: string;
  topics: AcceptedTopicEntry[];
};

export type ReviewBundle = {
  entries: TopicReviewEntry[];
  warnings: string[];
  accepted: AcceptedDecisionsFile;
};
