import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { revisionDemoMessages } from "../data/revision-fixtures";
import { groupRevisions } from "../announcements/revisions";
import {
  AnnouncementRevisionHistory,
  RevisionSuggestions,
} from "./announcement-revisions";
it("renders changed deadlines, venues and complete source history", () => {
  const group = groupRevisions(revisionDemoMessages).groups[0];
  const html = renderToStaticMarkup(
    <AnnouncementRevisionHistory group={group} />,
  );
  for (const value of [
    "Revision history (2 versions)",
    "Seminar Hall A",
    "Seminar Hall B",
    "10 November 2026",
    "12 November 2026",
    "<table",
    "<caption",
    "<details",
    "2026",
  ])
    expect(html).toContain(value);
  expect(html).toContain("Previous");
  expect(html).toContain("Updated");
});
it("keeps singleton views quiet and exposes an explicit confirmation action", () => {
  const grouped = groupRevisions([revisionDemoMessages[0]]);
  expect(
    renderToStaticMarkup(
      <AnnouncementRevisionHistory group={grouped.groups[0]} />,
    ),
  ).toBe("");
  const r = groupRevisions([
    revisionDemoMessages[0],
    { ...revisionDemoMessages[1], headers: {} },
  ]);
  const html = renderToStaticMarkup(
    <RevisionSuggestions suggestions={r.suggestions} onConfirm={() => {}} />,
  );
  expect(html).toContain("Confirm these are revisions");
  expect(html).toContain("Possible revisions");
});
it("escapes original source markup instead of rendering it", () => {
  const items = revisionDemoMessages.map((m) => ({
    ...m,
    body: m.body + "<script>private()</script>",
  }));
  const html = renderToStaticMarkup(
    <AnnouncementRevisionHistory group={groupRevisions(items).groups[0]} />,
  );
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
});
