import { expect, it } from "vitest";
import { revisionDemoMessages as pair } from "../data/revision-fixtures";
import {
  groupRevisions,
  normalizedSubject,
  revisionChanges,
  revisionKey,
} from "./revisions";
it("groups explicit threads without mutating or losing original history", () => {
  const before = structuredClone(pair),
    r = groupRevisions([...pair].reverse());
  expect(r.groups).toHaveLength(1);
  expect(r.groups[0].messages.map((m) => m.id)).toEqual(pair.map((m) => m.id));
  expect(r.groups[0].latest.id).toBe(pair[1].id);
  expect(pair).toEqual(before);
  expect(revisionChanges(pair[0], pair[1])).toEqual(
    expect.arrayContaining([
      { field: "Venue", before: "Seminar Hall A", after: "Seminar Hall B" },
    ]),
  );
  expect(
    revisionChanges(pair[0], pair[1]).find((c) => c.field === "Deadline")
      ?.after,
  ).toContain("12 November 2026");
});
it("requires user confirmation for a subject-only candidate", () => {
  const newer = { ...pair[1], headers: {} };
  const r = groupRevisions([pair[0], newer]);
  expect(r.groups).toHaveLength(2);
  expect(r.suggestions).toHaveLength(1);
  expect(
    groupRevisions([pair[0], newer], new Set([r.suggestions[0].key])).groups,
  ).toHaveLength(1);
});
it("does not combine different senders, subjects, distant messages or invalid dates", () => {
  for (const change of [
    { from: "someone@example.edu" },
    { subject: "Another workshop" },
    { receivedAt: "2027-11-06T09:00:00Z", headers: {} },
    { receivedAt: "bad" },
  ]) {
    const r = groupRevisions([pair[0], { ...pair[1], ...change }]);
    expect(r.groups).toHaveLength(2);
    expect(r.suggestions).toHaveLength(0);
  }
});
it("does not trust duplicate message-ID aliases and requires matching subjects even with references", () => {
  const duplicate = { ...pair[0], id: "other", subject: "Another subject" };
  const r = groupRevisions([pair[0], duplicate, pair[1]]);
  expect(r.groups).toHaveLength(3);
  expect(
    groupRevisions([pair[0], { ...pair[1], subject: "Unrelated report" }])
      .groups,
  ).toHaveLength(2);
});
it("follows a reference chain, preserves removed values, and normalizes prefixes conservatively", () => {
  const last = {
    ...pair[1],
    id: "third",
    subject: "Re: Re: Workshop registration",
    body: "Register by 13 November 2026 at 6 PM.",
    headers: {
      references:
        "<workshop-original@example.edu> <workshop-update@example.edu>",
    },
  };
  expect(groupRevisions([...pair, last]).groups[0].messages).toHaveLength(3);
  expect(revisionChanges(pair[1], last)).toContainEqual({
    field: "Venue",
    before: "Seminar Hall B",
    after: "Not stated",
  });
  expect(normalizedSubject("Fwd: Re: [Updated] Workshop  registration")).toBe(
    "workshop registration",
  );
  expect(revisionKey("a", "b")).toBe(revisionKey("b", "a"));
});
