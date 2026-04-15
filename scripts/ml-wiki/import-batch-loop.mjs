/**
 * Run multiple ml-wiki import batches in sequence: import → validate → build
 * → update README progress → git commit.
 *
 * Avoids fragile bash regex/backtick parsing of README note IDs.
 *
 * Usage:
 *   node scripts/ml-wiki/import-batch-loop.mjs --iterations 10 --count 10 --pull \
 *     --deck "Machine Learning by Henrik Nordberg"
 */
import { spawnSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");
const readmePath = join(root, "scripts", "ml-wiki", "README.md");
const importScript = join(root, "scripts", "ml-wiki", "import-anki-batch.mjs");
const DEFAULT_DECK = "Machine Learning by Henrik Nordberg";

const README_ROW_RE =
  /\| `\d+` \| Strictly greater than `\d+` \(sort ascending; take the next window\)\. \|/;

function parseArgs(argv) {
  const out = {
    iterations: 10,
    count: 10,
    pull: false,
    deck: DEFAULT_DECK,
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--iterations") out.iterations = Number(argv[++i], 10);
    else if (a === "--count") out.count = Number(argv[++i], 10);
    else if (a === "--deck") out.deck = argv[++i];
    else if (a === "--pull") out.pull = true;
    else if (a === "--dry-run") out.dryRun = true;
    else {
      console.error(`Unknown arg: ${a}`);
      process.exit(2);
    }
  }
  if (!out.iterations || out.iterations < 1) {
    console.error("--iterations must be >= 1");
    process.exit(2);
  }
  if (!out.count || out.count < 1) {
    console.error("--count must be >= 1");
    process.exit(2);
  }
  if (!out.pull) {
    console.error("This loop driver expects --pull (AnkiConnect).");
    process.exit(2);
  }
  return out;
}

function readLastProcessedId() {
  const s = readFileSync(readmePath, "utf8");
  const m = s.match(/\| `(\d+)` \| Strictly greater than `\d+`/);
  if (!m) {
    throw new Error(
      "Could not parse Last processed note ID from scripts/ml-wiki/README.md"
    );
  }
  return m[1];
}

function writeLastProcessedId(id) {
  const s = readFileSync(readmePath, "utf8");
  const row = `| \`${id}\` | Strictly greater than \`${id}\` (sort ascending; take the next window). |`;
  const next = s.replace(README_ROW_RE, row);
  if (next === s) {
    throw new Error(
      "README progress row replace failed (pattern mismatch). Check scripts/ml-wiki/README.md table."
    );
  }
  writeFileSync(readmePath, next, "utf8");
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    stdio: opts.stdio ?? "inherit",
    ...opts,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    const err = (r.stderr || "").trim();
    throw new Error(
      `${cmd} ${args.join(" ")} exited ${r.status}${err ? `: ${err}` : ""}`
    );
  }
  return r;
}

function npmRun(script) {
  const r = spawnSync(`npm run ${script}`, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    stdio: "inherit",
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(`npm run ${script} exited ${r.status}`);
  }
}

function runImportCaptureStdout(after, count, deck) {
  const r = spawnSync(
    process.execPath,
    [
      importScript,
      "--after",
      after,
      "--count",
      String(count),
      "--pull",
      "--deck",
      deck,
    ],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
  );
  if (r.error) throw r.error;
  const stdout = (r.stdout || "").trimEnd();
  const stderr = (r.stderr || "").trimEnd();
  if (r.status !== 0) {
    throw new Error(
      `import-anki-batch failed (${r.status}): ${stderr || stdout || "(no output)"}`
    );
  }
  return { stdout, stderr };
}

function parseImportedTopics(stdout) {
  const m = stdout.match(/Imported (\d+) topic\(s\):/);
  return m ? Number(m[1], 10) : 0;
}

function parseLastNoteId(stdout) {
  const m = stdout.match(/Last note ID in batch: (\d+)/);
  return m ? m[1] : null;
}

function main() {
  const args = parseArgs(process.argv);
  for (let i = 1; i <= args.iterations; i++) {
    const after = readLastProcessedId();
    console.log(`\n=== Batch ${i}/${args.iterations} (after ${after}, count ${args.count}) ===\n`);
    const { stdout, stderr } = runImportCaptureStdout(after, args.count, args.deck);
    if (stderr) console.error(stderr);
    console.log(stdout);

    if (stdout.includes("No notes to import.") || parseImportedTopics(stdout) === 0) {
      console.log("No more notes to import; stopping loop.");
      break;
    }

    const lastId = parseLastNoteId(stdout);
    if (!lastId) {
      throw new Error("Could not parse Last note ID in batch from importer output.");
    }

    if (!args.dryRun) {
      writeLastProcessedId(lastId);
      npmRun("ml-wiki:validate");
      npmRun("build");
      run("git", ["add", "scripts/ml-wiki/README.md", "src/app/ml/wiki/content/topics.json", "src/app/ml/wiki/content/manifest.json"], {
        stdio: "inherit",
      });
      run("git", ["commit", "-m", `ml-wiki: import batch (max noteId ${lastId})\n`], {
        stdio: "inherit",
      });
    }
  }
}

main();
