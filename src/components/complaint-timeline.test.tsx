import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ComplaintTimeline } from "./complaint-timeline";
import type { ComplaintTimelineEvent } from "./complaint-timeline";

// ---------------------------------------------------------------------------
// Synthetic test fixtures — no real data
// ---------------------------------------------------------------------------

const singleEvent: ComplaintTimelineEvent = {
  status: "submitted",
  timestamp: "2026-10-10T09:00:00.000Z",
  publicUpdate: "Your complaint has been received.",
};

const multiEventsSorted: ComplaintTimelineEvent[] = [
  {
    status: "submitted",
    timestamp: "2026-10-10T09:00:00.000Z",
    publicUpdate: "Your complaint has been received.",
  },
  {
    status: "acknowledged",
    timestamp: "2026-10-11T14:30:00.000Z",
    publicUpdate: "A maintenance team has been notified.",
  },
  {
    status: "in_progress",
    timestamp: "2026-10-12T10:15:00.000Z",
    publicUpdate: "A technician is inspecting the reported area.",
  },
  {
    status: "resolved",
    timestamp: "2026-10-14T16:00:00.000Z",
    publicUpdate: "The issue has been fixed. Thank you for reporting.",
  },
];

const outOfOrderEvents: ComplaintTimelineEvent[] = [
  {
    status: "resolved",
    timestamp: "2026-10-14T16:00:00.000Z",
    publicUpdate: "Resolved now.",
  },
  {
    status: "submitted",
    timestamp: "2026-10-10T09:00:00.000Z",
    publicUpdate: "Received.",
  },
  {
    status: "acknowledged",
    timestamp: "2026-10-11T14:30:00.000Z",
    publicUpdate: "Noted.",
  },
];

// ---------------------------------------------------------------------------
// 1. Single-event history
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — single event", () => {
  it("renders the status, timestamp and public update", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    expect(html).toContain("Submitted");
    expect(html).toContain("Your complaint has been received.");
    expect(html).toContain("2026-10-10T09:00:00.000Z"); // dateTime attribute
  });

  it("uses an ordered list with a single item", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    expect(html).toContain("<ol");
    expect(html).toContain("<li");
  });

  it("renders a <time> element with the ISO dateTime attribute", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    expect(html).toMatch(/<time[^>]*dateTime="2026-10-10T09:00:00.000Z"/);
  });
});

// ---------------------------------------------------------------------------
// 2–3. Multi-event and chronological ordering
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — multi-event and ordering", () => {
  it("renders all events from a multi-event history", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={multiEventsSorted} />,
    );
    expect(html).toContain("Submitted");
    expect(html).toContain("Acknowledged");
    expect(html).toContain("In progress");
    expect(html).toContain("Resolved");
    expect(html).toContain("A maintenance team has been notified.");
    expect(html).toContain("A technician is inspecting the reported area.");
  });

  it("sorts out-of-order events chronologically", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={outOfOrderEvents} />,
    );
    const receivedIdx = html.indexOf("Received.");
    const notedIdx = html.indexOf("Noted.");
    const resolvedIdx = html.indexOf("Resolved now.");
    expect(receivedIdx).toBeLessThan(notedIdx);
    expect(notedIdx).toBeLessThan(resolvedIdx);
  });

  it("preserves input order for events with equal timestamps", () => {
    const sameTime: ComplaintTimelineEvent[] = [
      { status: "submitted", timestamp: "2026-10-10T09:00:00.000Z", publicUpdate: "First" },
      { status: "acknowledged", timestamp: "2026-10-10T09:00:00.000Z", publicUpdate: "Second" },
    ];
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={sameTime} />,
    );
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"));
  });
});

// ---------------------------------------------------------------------------
// 4. Correct rendering of status, timestamp and public update
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — rendering details", () => {
  it("renders a readable formatted timestamp in the visible text", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    // Formatted date should contain day, month, year
    expect(html).toMatch(/10\s+Oct\s+2026/);
  });

  it("renders a deterministic timestamp in the configured application timezone (Asia/Kolkata)", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    // 2026-10-10T09:00:00.000Z in Asia/Kolkata (UTC+5:30) is 14:30
    expect(html).toContain("10 Oct 2026, 14:30");
  });

  it("renders the status indicator for each event", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={multiEventsSorted} />,
    );
    // The ComplaintStatusIndicator renders "Status: " prefix visually hidden
    const matches = html.match(/Status: /g);
    expect(matches).toHaveLength(multiEventsSorted.length);
  });
});

// ---------------------------------------------------------------------------
// 5. Long history
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — long history", () => {
  it("renders 20 events without structural issues", () => {
    const longHistory: ComplaintTimelineEvent[] = Array.from(
      { length: 20 },
      (_, i) => ({
        status: i % 2 === 0 ? "in_progress" : "acknowledged",
        timestamp: `2026-10-${String(i + 1).padStart(2, "0")}T12:00:00.000Z`,
        publicUpdate: `Update number ${i + 1} with some additional detail to simulate realistic content length.`,
      }),
    );
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={longHistory} />,
    );
    const itemCount = (html.match(/<li/g) || []).length;
    expect(itemCount).toBe(20);
    expect(html).toContain("Update number 1");
    expect(html).toContain("Update number 20");
  });

  it("handles long public update text without breaking markup", () => {
    const longText = "A".repeat(1000);
    const event: ComplaintTimelineEvent = {
      status: "in_progress",
      timestamp: "2026-10-10T09:00:00.000Z",
      publicUpdate: longText,
    };
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[event]} />,
    );
    expect(html).toContain(longText);
  });
});

// ---------------------------------------------------------------------------
// 6. Empty history
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — empty history", () => {
  it("renders an accessible empty state message", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[]} />,
    );
    expect(html).toContain("No status updates yet.");
    expect(html).toContain('aria-label="Complaint status history"');
    expect(html).not.toContain("<ol");
    expect(html).not.toContain("<li");
  });

  it("handles null or undefined events safely without throwing", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={undefined as unknown as ComplaintTimelineEvent[]} />,
    );
    expect(html).toContain("No status updates yet.");
  });
});

// ---------------------------------------------------------------------------
// 7. Privacy isolation — CRITICAL
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — privacy isolation", () => {
  it("never renders moderator IDs from extra event fields", () => {
    const eventWithPrivate = {
      status: "acknowledged",
      timestamp: "2026-10-11T14:30:00.000Z",
      publicUpdate: "A team has been notified.",
      moderatorId: "mod-secret-id-12345",
      moderatorName: "Jane Admin",
    } as unknown as ComplaintTimelineEvent;

    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[eventWithPrivate]} />,
    );
    expect(html).not.toContain("mod-secret-id-12345");
    expect(html).not.toContain("Jane Admin");
    expect(html).not.toContain("moderatorId");
    expect(html).not.toContain("moderatorName");
    expect(html).toContain("A team has been notified.");
  });

  it("never renders internal notes from extra event fields", () => {
    const eventWithNotes = {
      status: "in_progress",
      timestamp: "2026-10-12T10:15:00.000Z",
      publicUpdate: "Work is underway.",
      internalNotes: "Check with plumbing contractor — deadline overdue",
      reporterEmail: "student123@example.edu",
      reporterId: "usr-987",
    } as unknown as ComplaintTimelineEvent;

    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[eventWithNotes]} />,
    );
    expect(html).not.toContain("plumbing contractor");
    expect(html).not.toContain("deadline overdue");
    expect(html).not.toContain("student123@example.edu");
    expect(html).not.toContain("usr-987");
    expect(html).not.toContain("internalNotes");
    expect(html).not.toContain("reporterEmail");
    expect(html).not.toContain("reporterId");
    expect(html).toContain("Work is underway.");
  });

  it("does not serialize or spread the full event object", () => {
    const poison = {
      status: "submitted",
      timestamp: "2026-10-10T09:00:00.000Z",
      publicUpdate: "Received.",
      secretToken: "bearer-abc-xyz-000",
      adminAction: "escalated to dean",
      __proto_field__: "should not appear",
    } as unknown as ComplaintTimelineEvent;

    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[poison]} />,
    );
    expect(html).not.toContain("bearer-abc-xyz-000");
    expect(html).not.toContain("escalated to dean");
    expect(html).not.toContain("secretToken");
    expect(html).not.toContain("adminAction");
    expect(html).not.toContain("__proto_field__");
  });

  it("strips private fields from multiple events in a history", () => {
    const mixedHistory = [
      {
        status: "submitted",
        timestamp: "2026-10-10T09:00:00.000Z",
        publicUpdate: "Received.",
        moderatorId: "mod-001",
      },
      {
        status: "resolved",
        timestamp: "2026-10-14T16:00:00.000Z",
        publicUpdate: "Fixed.",
        internalNotes: "Contact facilities lead",
        reporterName: "Anonymous Student",
      },
    ] as unknown as ComplaintTimelineEvent[];

    const html = renderToStaticMarkup(
      <ComplaintTimeline events={mixedHistory} />,
    );
    expect(html).not.toContain("mod-001");
    expect(html).not.toContain("Contact facilities lead");
    expect(html).not.toContain("Anonymous Student");
    expect(html).toContain("Received.");
    expect(html).toContain("Fixed.");
  });
});

// ---------------------------------------------------------------------------
// 8. Missing or invalid values
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — missing or invalid values", () => {
  it("handles an event with an empty status gracefully", () => {
    const event: ComplaintTimelineEvent = {
      status: "",
      timestamp: "2026-10-10T09:00:00.000Z",
      publicUpdate: "Something happened.",
    };
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[event]} />,
    );
    expect(html).toContain("Unknown status");
    expect(html).toContain("Something happened.");
  });

  it("handles an event with an invalid timestamp", () => {
    const event: ComplaintTimelineEvent = {
      status: "submitted",
      timestamp: "not-a-date",
      publicUpdate: "Received.",
    };
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[event]} />,
    );
    // Invalid dates use the raw string
    expect(html).toContain("not-a-date");
    expect(html).toContain("Submitted");
  });

  it("handles an event with an empty publicUpdate", () => {
    const event: ComplaintTimelineEvent = {
      status: "submitted",
      timestamp: "2026-10-10T09:00:00.000Z",
      publicUpdate: "",
    };
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[event]} />,
    );
    expect(html).toContain("Submitted");
    // Should still render without crashing
    expect(html).toContain("<p");
  });

  it("handles nullish-like field values without crashing", () => {
    const event = {
      status: undefined,
      timestamp: undefined,
      publicUpdate: undefined,
    } as unknown as ComplaintTimelineEvent;
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[event]} />,
    );
    expect(html).toContain("Unknown status");
  });
});

// ---------------------------------------------------------------------------
// 9. Semantic structure and accessibility
// ---------------------------------------------------------------------------

describe("ComplaintTimeline — semantics and accessibility", () => {
  it("uses a section with an aria-label for the timeline region", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    expect(html).toContain("<section");
    expect(html).toContain('aria-label="Complaint status history"');
  });

  it("uses an ordered list for the events", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={multiEventsSorted} />,
    );
    expect(html).toContain("<ol");
    const liCount = (html.match(/<li/g) || []).length;
    expect(liCount).toBe(4);
  });

  it("marks decorative connectors as aria-hidden", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("does not introduce interactive controls, tab stops or live regions", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={multiEventsSorted} />,
    );
    expect(html).not.toMatch(/tabindex|<button|<a\b|role="status"|aria-live/);
  });

  it("includes readable text content for every event field", () => {
    const html = renderToStaticMarkup(
      <ComplaintTimeline events={[singleEvent]} />,
    );
    // Status label is readable
    expect(html).toContain("Submitted");
    // Public update is readable
    expect(html).toContain("Your complaint has been received.");
    // Time element has readable content
    expect(html).toContain("<time");
  });
});
