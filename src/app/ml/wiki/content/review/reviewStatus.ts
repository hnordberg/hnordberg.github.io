export type ReviewStatus =
  | "ok"
  | "minor_edit"
  | "needs_changes"
  | "reject_or_regenerate"
  | "merge_candidate"
  | "split_candidate";