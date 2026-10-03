import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const catalogPath = path.join(root, "docs", "CHALLENGES.md");

export const batches = {
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

export const expectedIds = Object.values(batches).flat();

export async function readChallenges() {
  const markdown = await readFile(catalogPath, "utf8");
  const challengePattern =
    /^## (SIG-\d{3}) — (.+)\r?\n([\s\S]*?)(?=\r?\n## SIG-\d{3}|\r?\n---\s*(?:\r?\n|$))/gm;
  const challenges = [];

  for (const match of markdown.matchAll(challengePattern)) {
    const [, id, title, rawBody] = match;
    const labelMatch = rawBody.match(/^[*_]Labels:[*_]\s*(.+?)\s*$/m);
    const labels = labelMatch
      ? labelMatch[1]
          .replace(/\s{2,}$/, "")
          .split(",")
          .map((label) => label.trim())
      : [];
    const body = rawBody.replace(/^[*_]Labels:[*_].+(?:\r?\n)?/m, "").trim();

    challenges.push({ id, title: title.trim(), labels, body });
  }

  return challenges;
}

export function selectBatch(challenges, batch) {
  if (batch === "all") return challenges;

  const ids = batches[batch];
  if (!ids) {
    throw new Error(
      `Unknown batch "${batch}". Use ${Object.keys(batches).join(", ")}, or all.`,
    );
  }

  const byId = new Map(
    challenges.map((challenge) => [challenge.id, challenge]),
  );
  return ids.map((id) => byId.get(id)).filter(Boolean);
}
