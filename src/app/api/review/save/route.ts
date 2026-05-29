import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";

import { ACCEPTED_FILE_PATH } from "../../../ml/wiki/review/lib/loadReview";
import type {
  AcceptedDecisionsFile,
  AcceptedTopicEntry,
  JsonPatchOp,
} from "../../../ml/wiki/review/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function isJsonPatchOp(v: unknown): v is JsonPatchOp {
  return (
    isObject(v) &&
    typeof v.op === "string" &&
    typeof v.path === "string"
  );
}

function isAcceptedTopicEntry(v: unknown): v is AcceptedTopicEntry {
  return (
    isObject(v) &&
    typeof v.slug === "string" &&
    Array.isArray(v.acceptedPatches) &&
    Array.isArray(v.rejectedPatches) &&
    v.acceptedPatches.every(isJsonPatchOp) &&
    v.rejectedPatches.every(isJsonPatchOp)
  );
}

function isAcceptedDecisionsFile(v: unknown): v is AcceptedDecisionsFile {
  return (
    isObject(v) &&
    v.version === 1 &&
    typeof v.updatedAt === "string" &&
    Array.isArray(v.topics) &&
    v.topics.every(isAcceptedTopicEntry)
  );
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Disabled outside dev mode." },
      { status: 403 }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!isAcceptedDecisionsFile(body)) {
    return NextResponse.json(
      { error: "Body does not match AcceptedDecisionsFile shape." },
      { status: 400 }
    );
  }
  await fs.writeFile(
    ACCEPTED_FILE_PATH,
    JSON.stringify(body, null, 2) + "\n",
    "utf8"
  );
  return NextResponse.json({ ok: true, path: ACCEPTED_FILE_PATH });
}
