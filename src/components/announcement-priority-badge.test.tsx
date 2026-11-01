import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mockAnnouncementsFixture } from "../data/announcement-fixtures";
import {
  AnnouncementBadge,
  AnnouncementPriorityBadge,
  PRIORITY_CONFIG,
  resolvePriority,
} from "./announcement-priority-badge";

describe("AnnouncementPriorityBadge - approved priorities", () => {
  it.each([
    ["urgent", "URGENT", "!"],
    ["action_required", "ACTION REQUIRED", "▶"],
    ["upcoming", "UPCOMING", "◷"],
    ["informational", "INFO", "ℹ"],
  ] as const)(
    "renders visible text and distinctive icon/shape for approved priority %s",
    (priority, expectedLabel, expectedIcon) => {
      const html = renderToStaticMarkup(
        <AnnouncementPriorityBadge priority={priority} />,
      );

      // Priority text and icon
      expect(html).toContain(expectedLabel);
      expect(html).toContain(expectedIcon);

      // Data attribute and CSS class
      expect(html).toContain(`data-priority="${priority}"`);
      expect(html).toContain(`priority-${priority}`);
      expect(html).toContain("announcement-badge");

      // Accessibility: decorative icon is hidden, screen reader prefix provided
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain("Priority: ");
    },
  );

  it("exports AnnouncementBadge as an identical alias", () => {
    const html1 = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="urgent" />,
    );
    const html2 = renderToStaticMarkup(
      <AnnouncementBadge priority="urgent" />,
    );
    expect(html1).toBe(html2);
  });
});

describe("AnnouncementPriorityBadge - safe fallback behavior", () => {
  it.each([
    undefined,
    null,
    "",
    "unknown",
    "emergency",
    "critical",
    "HIGH",
    "__proto__",
    "constructor",
    "toString",
  ])(
    "safely falls back to informational priority for missing or unknown value %s",
    (rawPriority) => {
      const html = renderToStaticMarkup(
        <AnnouncementPriorityBadge priority={rawPriority as string | undefined} />,
      );

      expect(html).toContain("INFO");
      expect(html).toContain("ℹ");
      expect(html).toContain('data-priority="informational"');
      expect(html).toContain("priority-informational");
      expect(html).not.toContain("URGENT");
      expect(html).not.toContain("ACTION REQUIRED");
      expect(html).not.toContain("UPCOMING");
    },
  );

  it("never reflects untrusted strings or markup into the rendered HTML", () => {
    const maliciousInput = '<img src=x onerror="alert(1)">';
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority={maliciousInput} />,
    );

    expect(html).not.toContain("img");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert");
    expect(html).toContain("INFO");
    expect(html).toContain("ℹ");
    expect(html).toContain('data-priority="informational"');
  });

  it("resolvePriority returns canonical priority or fallback", () => {
    expect(resolvePriority("urgent")).toBe("urgent");
    expect(resolvePriority("action_required")).toBe("action_required");
    expect(resolvePriority("upcoming")).toBe("upcoming");
    expect(resolvePriority("informational")).toBe("informational");
    expect(resolvePriority(undefined)).toBe("informational");
    expect(resolvePriority(null)).toBe("informational");
    expect(resolvePriority("invalid")).toBe("informational");
    expect(resolvePriority("constructor")).toBe("informational");
  });
});

describe("AnnouncementPriorityBadge - accessibility & interaction modes", () => {
  it("renders as static text by default without tabIndex or button role", () => {
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="urgent" />,
    );

    expect(html).not.toContain("tabindex");
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("<button");
  });

  it("supports interactive mode with keyboard focus and button role when interactive=true", () => {
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="action_required" interactive />,
    );

    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="button"');
    expect(html).toContain("announcement-badge-interactive");
  });

  it("supports interactive mode when onClick is provided", () => {
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="upcoming" onClick={() => {}} />,
    );

    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="button"');
    expect(html).toContain("announcement-badge-interactive");
  });

  it("allows custom HTML element via 'as' prop", () => {
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="informational" as="button" />,
    );

    expect(html).toMatch(/^<button/);
    expect(html).toContain("announcement-badge");
  });

  it("appends custom className cleanly", () => {
    const html = renderToStaticMarkup(
      <AnnouncementPriorityBadge priority="urgent" className="custom-class" />,
    );

    expect(html).toContain("announcement-badge");
    expect(html).toContain("priority-urgent");
    expect(html).toContain("custom-class");
  });
});

describe("AnnouncementPriorityBadge - synthetic fixtures compatibility", () => {
  it.each(mockAnnouncementsFixture)(
    "correctly renders priority badge for announcement fixture $id",
    (announcement) => {
      const html = renderToStaticMarkup(
        <AnnouncementPriorityBadge priority={announcement.priority} />,
      );

      const expectedPriority = announcement.priority || "informational";
      const config = PRIORITY_CONFIG[expectedPriority];

      expect(html).toContain(config.label);
      expect(html).toContain(config.icon);
      expect(html).toContain(`data-priority="${expectedPriority}"`);
      expect(html).toContain(`priority-${expectedPriority}`);
    },
  );
});
