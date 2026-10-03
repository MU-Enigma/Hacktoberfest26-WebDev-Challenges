import { batches, expectedIds, readChallenges } from "./lib/challenges.mjs";

const allowedLabels = new Set([
  "level:starter",
  "level:core",
  "level:advanced",
  "level:final",
  "track:announcements",
  "track:complaints",
  "track:mail-provider",
  "track:quality",
  "track:documentation",
  "type:frontend",
  "type:backend",
  "type:full-stack",
  "type:testing",
  "type:accessibility",
  "type:security",
  "type:devops",
  "size:xs",
  "size:s",
  "size:m",
  "size:l",
  "good first issue",
  "release:required",
  "release:stretch",
]);

const errors = [];
const challenges = await readChallenges();
const foundIds = challenges.map(({ id }) => id);
const uniqueIds = new Set(foundIds);

if (challenges.length !== 36) {
  errors.push(`Expected 36 challenges; found ${challenges.length}.`);
}

if (uniqueIds.size !== foundIds.length) {
  errors.push("Challenge IDs must be unique.");
}

for (const id of expectedIds) {
  if (!uniqueIds.has(id)) errors.push(`Missing ${id}.`);
}

for (const challenge of challenges) {
  for (const heading of [
    "### Goal",
    "### Acceptance criteria",
    "### Required evidence",
  ]) {
    if (!challenge.body.includes(heading)) {
      errors.push(`${challenge.id} is missing ${heading}.`);
    }
  }

  if (challenge.labels.length < 4) {
    errors.push(`${challenge.id} needs level, track, type, and size labels.`);
  }

  for (const label of challenge.labels) {
    if (!allowedLabels.has(label)) {
      errors.push(`${challenge.id} uses unknown label "${label}".`);
    }
  }
}

if (new Set(expectedIds).size !== expectedIds.length) {
  errors.push("A challenge appears in more than one release batch.");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${challenges.length} challenges across ${Object.keys(batches).length} release batches.`,
);
