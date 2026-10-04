import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const batches = {
  opening: [
    "SIG-001",
    "SIG-002",
    "SIG-003",
    "SIG-004",
    "SIG-005",
    "SIG-006",
    "SIG-007",
    "SIG-008",
    "SIG-101",
    "SIG-102",
    "SIG-201",
    "SIG-401",
  ],
  contracts: [
    "SIG-103",
    "SIG-104",
    "SIG-105",
    "SIG-106",
    "SIG-107",
    "SIG-202",
    "SIG-203",
    "SIG-301",
    "SIG-304",
  ],
  stabilized: [
    "SIG-108",
    "SIG-109",
    "SIG-204",
    "SIG-205",
    "SIG-206",
    "SIG-207",
    "SIG-208",
    "SIG-302",
    "SIG-303",
    "SIG-305",
    "SIG-306",
    "SIG-307",
  ],
  final: ["SIG-402", "SIG-403", "SIG-404"],
};

async function readChallenges() {
  const markdown = await readFile("CHALLENGES.md", "utf8");
  const pattern =
    /^## (SIG-\d{3}) — (.+)\r?\n([\s\S]*?)(?=\r?\n## SIG-\d{3}|\r?\n---\s*(?:\r?\n|$))/gm;
  const challenges = [];

  for (const match of markdown.matchAll(pattern)) {
    const [, id, title, rawBody] = match;
    const labelLine = rawBody.match(/^[*_]Labels:[*_]\s*(.+?)\s*$/m);
    const labels = (labelLine?.[1] ?? "")
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);
    const body = rawBody
      .replace(/^[*_]Labels:[*_].+(?:\r?\n)?/m, "")
      .trim();

    challenges.push({ id, title: title.trim(), labels, body });
  }

  if (challenges.length !== 36) {
    throw new Error(`Expected 36 challenges, found ${challenges.length}.`);
  }

  return challenges;
}

function selectBatch(challenges, batch) {
  if (batch === "all") return challenges;
  if (!batches[batch]) {
    throw new Error(`Unknown batch: ${batch}`);
  }

  const byId = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  return batches[batch].map((id) => byId.get(id));
}

const labelCatalog = {
  easy: ["2DA44E", "Beginner-friendly task"],
  intermediate: ["0969DA", "Task requiring some project experience"],
  hard: ["D97706", "Complex task with multiple moving parts"],
  expert: ["B60205", "Release-critical or specialist task"],
  "level:starter": ["2DA44E", "Independent first contribution"],
  "level:core": ["0969DA", "Core product work"],
  "level:advanced": ["8250DF", "Advanced integration or architecture work"],
  "level:final": ["BF8700", "Release-stage challenge"],
  "track:announcements": ["1D76DB", "Announcement workflow"],
  "track:complaints": ["0E8A16", "Operational complaint workflow"],
  "track:mail-provider": ["5319E7", "Mailbox provider or synchronization"],
  "track:quality": [
    "D4C5F9",
    "Testing, accessibility, security, or release quality",
  ],
  "track:documentation": ["0075CA", "Documentation"],
  "type:frontend": ["C5DEF5", "Frontend work"],
  "type:backend": ["BFDADC", "Backend work"],
  "type:full-stack": ["BFE5BF", "Frontend and backend work"],
  "type:testing": ["D4C5F9", "Test infrastructure or coverage"],
  "type:accessibility": ["FBCA04", "Accessibility work"],
  "type:security": ["B60205", "Security or privacy sensitive"],
  "type:devops": ["0052CC", "CI and project automation"],
  "size:xs": ["EDEDED", "Very small change"],
  "size:s": ["DDE8C4", "Small change"],
  "size:m": ["FEF2C0", "Medium change"],
  "size:l": ["F9D0C4", "Large change"],
  "status:available": ["2DA44E", "Ready to claim"],
  "status:claimed": ["FBCA04", "Assigned and in progress"],
  "status:blocked": ["B60205", "Blocked by a dependency"],
  "status:review": ["0969DA", "Pull request under review"],
  "good first issue": ["7057FF", "Friendly to first-time contributors"],
  "release:required": ["B60205", "Required for SIGNAL v1"],
  "release:stretch": ["C2E0C6", "Useful but not required for SIGNAL v1"],
};

const difficultyByLevel = {
  "level:starter": "easy",
  "level:core": "intermediate",
  "level:advanced": "hard",
  "level:final": "expert",
};

function getDifficultyLabel(challenge) {
  const matches = challenge.labels
    .map((label) => difficultyByLevel[label])
    .filter(Boolean);

  if (matches.length !== 1) {
    throw new Error(
      `${challenge.id} must have exactly one level label to determine difficulty.`,
    );
  }

  return matches[0];
}

function getInitialStatus(challenge, selectedBatch) {
  if (
    selectedBatch === "all" &&
    !batches.opening.includes(challenge.id)
  ) {
    return "status:blocked";
  }

  return "status:available";
}

function getFlag(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function runGh(args, { capture = false } = {}) {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = spawnSync("gh", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (result.error) throw result.error;

    if (result.status === 0) {
      if (!capture && result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
      return capture ? result.stdout : "";
    }

    const errorOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    const retryable =
      /TLS handshake timeout|connection reset|timed out|502|503|EOF/i.test(
        errorOutput,
      );

    if (!retryable || attempt === maxAttempts) {
      process.stderr.write(errorOutput);
      process.exit(result.status ?? 1);
    }

    console.warn(`GitHub request failed; retrying (${attempt}/${maxAttempts}).`);
    Atomics.wait(
      new Int32Array(new SharedArrayBuffer(4)),
      0,
      0,
      attempt * 1000,
    );
  }

  return "";
}

const batch = getFlag("--batch", "opening");
const repository = getFlag("--repo", undefined);
const apply = process.argv.includes("--apply");
const repoArgs = repository ? ["--repo", repository] : [];
const challenges = selectBatch(await readChallenges(), batch);

if (!apply) {
  console.log(
    `Dry run: ${challenges.length} issues from the "${batch}" batch.`,
  );
  for (const challenge of challenges) {
    console.log(
      `- [${challenge.id}] ${challenge.title} (${getDifficultyLabel(challenge)})`,
    );
  }
  console.log(
    "\nAdd --apply after reviewing this list. No GitHub changes were made.",
  );
  process.exit(0);
}

runGh(["--version"]);

const existingLabelsJson = runGh(
  ["label", "list", "--limit", "100", "--json", "name", ...repoArgs],
  { capture: true },
);
const existingLabels = new Set(
  JSON.parse(existingLabelsJson).map((label) => label.name),
);

for (const [name, [color, description]] of Object.entries(labelCatalog)) {
  if (existingLabels.has(name)) continue;

  runGh([
    "label",
    "create",
    name,
    "--color",
    color,
    "--description",
    description,
    ...repoArgs,
  ]);
}

const existingJson = runGh(
  [
    "issue",
    "list",
    "--state",
    "all",
    "--limit",
    "500",
    "--json",
    "title",
    ...repoArgs,
  ],
  { capture: true },
);
const existingTitles = new Set(
  JSON.parse(existingJson).map((issue) => issue.title),
);

for (const challenge of challenges) {
  const title = `[${challenge.id}] ${challenge.title}`;
  if (existingTitles.has(title)) {
    console.log(`Skipping existing issue: ${title}`);
    continue;
  }

  const labels = [
    ...challenge.labels,
    getDifficultyLabel(challenge),
    getInitialStatus(challenge, batch),
  ];
  const args = [
    "issue",
    "create",
    "--title",
    title,
    "--body",
    challenge.body,
    ...repoArgs,
  ];

  for (const label of labels) args.push("--label", label);
  runGh(args);
}

console.log(`Published the "${batch}" challenge batch.`);
