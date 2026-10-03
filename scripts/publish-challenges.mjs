import { spawnSync } from "node:child_process";

import { readChallenges, selectBatch } from "./lib/challenges.mjs";

const labelCatalog = {
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
  "type:devops": ["0052CC", "CI, deployment, or operations"],
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

function getFlag(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function runGh(args, { capture = false } = {}) {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  return capture ? result.stdout : "";
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
    console.log(`- [${challenge.id}] ${challenge.title}`);
  }
  console.log(
    "\nAdd --apply after reviewing this list. No GitHub changes were made.",
  );
  process.exit(0);
}

runGh(["--version"]);

for (const [name, [color, description]] of Object.entries(labelCatalog)) {
  runGh([
    "label",
    "create",
    name,
    "--color",
    color,
    "--description",
    description,
    "--force",
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

  const labels = [...challenge.labels, "status:available"];
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
