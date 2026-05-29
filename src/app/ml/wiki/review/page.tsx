import { loadReviewBundle } from "./lib/loadReview";
import { ReviewClient } from "./ReviewClient";

export const metadata = {
  title: "Topic Review",
};

export default async function ReviewPage() {
  const bundle = await loadReviewBundle();
  return <ReviewClient bundle={bundle} />;
}
