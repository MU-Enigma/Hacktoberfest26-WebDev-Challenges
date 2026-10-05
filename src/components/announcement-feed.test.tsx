import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import {
  Announcement,
  AnnouncementFeed,
  AnnouncementFeedEmpty,
  AnnouncementFeedError,
  AnnouncementFeedSkeleton,
  AnnouncementSkeletonRow,
  sanitizeErrorMessage,
} from "./announcement-feed";

const sampleAnnouncements: Announcement[] = [
  {
    id: "mail-001",
    from: "student.affairs@example.edu",
    subject: "Course registration closes Friday",
    receivedAt: "2026-10-05T09:30:00.000Z",
    preview: "Complete registration before 5:00 PM on 9 October.",
    priority: "action_required",
  },
  {
    id: "mail-002",
    from: "library@example.edu",
    subject: "Library hours during the mid-semester break",
    receivedAt: "2026-10-06T12:15:00.000Z",
    preview: "The library will use revised opening hours next week.",
    priority: "informational",
  },
];

describe("AnnouncementFeed - Loading State & Skeletons", () => {
  it("renders stable skeleton rows without layout shift", () => {
    const html = renderToStaticMarkup(<AnnouncementFeedSkeleton count={3} />);

    // Must have role="status" and aria-busy="true" for screen readers
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Loading announcements"');
    expect(html).toContain("Loading announcements. Please wait...");

    // Exactly 3 skeleton rows
    const matches = html.match(/data-testid="announcement-skeleton-row"/g);
    expect(matches?.length).toBe(3);

    // Each row must also bear .announcement-row for identical sizing, margin, and borders
    expect(html).toContain("announcement-row announcement-skeleton-row");
    expect(html).toContain("skeleton-badge");
    expect(html).toContain("skeleton-sender");
    expect(html).toContain("skeleton-time");
    expect(html).toContain("skeleton-subject");
    expect(html).toContain("skeleton-preview-group");
  });

  it("renders single skeleton row with aria-hidden to avoid duplicate screen reader noise", () => {
    const html = renderToStaticMarkup(<AnnouncementSkeletonRow />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("announcement-skeleton-row");
  });

  it("renders loading state when status prop is 'loading'", () => {
    const html = renderToStaticMarkup(
      <AnnouncementFeed status="loading" items={sampleAnnouncements} />,
    );
    expect(html).toContain('data-status="loading"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Loading announcements. Please wait...");
  });
});

describe("AnnouncementFeed - Empty State", () => {
  it("explains why messages are absent and how to connect or load mock mailbox", () => {
    const onLoadMockMailbox = vi.fn();
    const onConnectMailbox = vi.fn();

    const element = (
      <AnnouncementFeedEmpty
        onLoadMockMailbox={onLoadMockMailbox}
        onConnectMailbox={onConnectMailbox}
      />
    );
    const html = renderToStaticMarkup(element);

    expect(html).toContain("NO ANNOUNCEMENTS IN FEED");
    expect(html).toContain("FEED STATUS: 0 RECORDS");
    // Explains how to load mock mailbox
    expect(html).toContain("Load Synthetic Mock Mailbox");
    expect(html).toContain("Populate this feed with safe, deterministic mock announcements");
    expect(html).toContain("Load Mock Mailbox");

    // Explains how to connect live mailbox
    expect(html).toContain("Connect Live Campus Mailbox");
    expect(html).toContain("delegated OAuth 2.0");
    expect(html).toContain("Connect Mailbox...");

    // Calling the load mock mailbox callback
    const tree = AnnouncementFeedEmpty({
      onLoadMockMailbox,
      onConnectMailbox,
    });
    const buttons = findButtons(tree);
    const loadMockBtn = buttons.find((b) => b.props["aria-label"]?.includes("Load synthetic"));
    expect(loadMockBtn).toBeDefined();
    loadMockBtn?.props.onClick?.();
    expect(onLoadMockMailbox).toHaveBeenCalledTimes(1);

    const connectBtn = buttons.find((b) => b.props["aria-label"]?.includes("campus mailbox"));
    expect(connectBtn).toBeDefined();
    connectBtn?.props.onClick?.();
    expect(onConnectMailbox).toHaveBeenCalledTimes(1);
  });

  it("automatically renders empty state when items is empty and no error is present", () => {
    const html = renderToStaticMarkup(<AnnouncementFeed items={[]} />);
    expect(html).toContain('data-status="empty"');
    expect(html).toContain("NO ANNOUNCEMENTS IN FEED");
    expect(html).toContain("Announcement feed is empty. No messages available.");
  });
});

describe("AnnouncementFeed - Error State & Retry Action", () => {
  it("explains what failed and exposes a retry action", () => {
    const onRetry = vi.fn();
    const onLoadMock = vi.fn();

    const tree = AnnouncementFeedError({
      error: new Error("Network connection timed out"),
      onRetry,
      onLoadMockMailbox: onLoadMock,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain("UNABLE TO LOAD ANNOUNCEMENTS");
    expect(html).toContain("FEED STATUS: SYNC FAILURE");
    expect(html).toContain("Retry Synchronization");
    expect(html).toContain("Fallback: Load Mock Mailbox");

    // Trigger retry
    const buttons = findButtons(tree);
    const retryBtn = buttons.find((b) => b.props["aria-label"]?.includes("Retry announcement"));
    expect(retryBtn).toBeDefined();
    retryBtn?.props.onClick?.();
    expect(onRetry).toHaveBeenCalledTimes(1);

    const fallbackBtn = buttons.find((b) => b.props["aria-label"]?.includes("mock mailbox fallback"));
    expect(fallbackBtn).toBeDefined();
    fallbackBtn?.props.onClick?.();
    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  it("automatically renders error state when error prop is supplied", () => {
    const onRetry = vi.fn();
    const html = renderToStaticMarkup(
      <AnnouncementFeed error="Mailbox server timeout" onRetry={onRetry} />,
    );
    expect(html).toContain('data-status="error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Retry Synchronization");
  });
});

describe("sanitizeErrorMessage - Privacy & Token Protection", () => {
  it("does not expose Bearer tokens", () => {
    const rawError = "Failed 401 with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.super_secret_payload";
    const result = sanitizeErrorMessage(rawError);
    expect(result).not.toContain("Bearer");
    expect(result).not.toContain("eyJhbGci");
    expect(result).not.toContain("super_secret_payload");
    expect(result).toBe("Mailbox authentication session expired or is invalid. Please reconnect your mailbox.");
  });

  it("does not expose access_token or refresh_token key-value credentials", () => {
    const rawError = "Sync error: access_token=ya29.a0AfH6_secret12345 client_secret=very_secret";
    const result = sanitizeErrorMessage(rawError);
    expect(result).not.toContain("ya29.a0AfH6_secret12345");
    expect(result).not.toContain("very_secret");
    expect(result).not.toContain("access_token");
    expect(result).not.toContain("client_secret");
  });

  it("does not expose raw server stack traces or internal filesystem paths", () => {
    const rawError =
      "Error: connect ECONNREFUSED 127.0.0.1:993\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1605:16)\n    at emit (node:events:517:28)";
    const result = sanitizeErrorMessage(rawError);
    expect(result).not.toContain("TCPConnectWrap");
    expect(result).not.toContain("node:net");
    expect(result).not.toContain("1605:16");
    expect(result).toContain("Unable to establish a connection with the mailbox server.");
  });

  it("does not expose raw 500 server dumps or internal database queries", () => {
    const rawSql = "Internal error 500: SELECT * FROM mailbox_tokens WHERE secret='token_123'";
    const result = sanitizeErrorMessage(rawSql);
    expect(result).not.toContain("SELECT *");
    expect(result).not.toContain("token_123");
    expect(result).toContain("Unable to query announcement records. An internal service error occurred.");
  });

  it("handles 500 internal server error cleanly without stack traces", () => {
    const raw500 = "HTTP 500 Internal Server Error in /var/log/mail.ts:99";
    const result = sanitizeErrorMessage(raw500);
    expect(result).not.toContain("/var/log");
    expect(result).toContain("The announcement mailbox service is temporarily unavailable. Please retry shortly.");
  });

  it("handles null, undefined, or empty errors safely", () => {
    expect(sanitizeErrorMessage(null)).toBe(
      "An unknown error occurred while retrieving announcements. Please retry.",
    );
    expect(sanitizeErrorMessage(undefined)).toBe(
      "An unknown error occurred while retrieving announcements. Please retry.",
    );
    expect(sanitizeErrorMessage("")).toBe(
      "An unknown error occurred while retrieving announcements. Please retry.",
    );
  });

  it("sanitizes raw JavaScript runtime exceptions and uncaught errors", () => {
    const typeError = "TypeError: Cannot read properties of undefined (reading 'messages')";
    const result = sanitizeErrorMessage(typeError);
    expect(result).not.toContain("TypeError");
    expect(result).not.toContain("Cannot read properties");
    expect(result).toBe("An internal processing error occurred while parsing announcements. Please retry.");
  });

  it("sanitizes raw DNS and socket connection resets", () => {
    const socketError = "getaddrinfo ENOTFOUND imap.institution.edu";
    const result = sanitizeErrorMessage(socketError);
    expect(result).not.toContain("ENOTFOUND");
    expect(result).not.toContain("imap.institution.edu");
    expect(result).toBe("Unable to establish a connection with the mailbox server. Please check your network connection and retry.");
  });

  it("sanitizes Google OAuth access tokens and GitHub personal tokens", () => {
    const googleTokenErr = "Failed request with ya29.a0AfH6SMB_secretGoogleOAuthTokenValue12345";
    const result = sanitizeErrorMessage(googleTokenErr);
    expect(result).not.toContain("ya29.");
    expect(result).not.toContain("secretGoogleOAuthTokenValue");
    expect(result).toBe("Mailbox authentication session expired or is invalid. Please reconnect your mailbox.");
  });

  it("handles raw JSON error dumps safely", () => {
    const jsonError = '{"error":"invalid_client","error_description":"Client authentication failed"}';
    const result = sanitizeErrorMessage(jsonError);
    expect(result).not.toContain("invalid_client");
    expect(result).not.toContain("{");
    expect(result).toBe("An unexpected error occurred while loading announcements. Please retry.");
  });

  it("allows safe, non-sensitive custom messages through", () => {
    const safeMsg = "The campus announcement mailbox is currently scheduled for maintenance.";
    const result = sanitizeErrorMessage(safeMsg);
    expect(result).toBe(safeMsg);
  });
});

describe("AnnouncementFeed - Retry Action Keyboard & Focus Accessibility", () => {
  it("supports autoFocus on the retry button for immediate keyboard accessibility", () => {
    const onRetry = vi.fn();
    const tree = AnnouncementFeedError({
      error: "Connection timeout",
      onRetry,
      autoFocusRetry: true,
    });
    const buttons = findButtons(tree);
    const retryBtn = buttons.find((b) => b.props["aria-label"]?.includes("Retry announcement"));
    expect(retryBtn).toBeDefined();
    expect(retryBtn?.props.autoFocus).toBe(true);
  });
});

describe("AnnouncementFeed - Screen Reader Updates", () => {
  it("provides live status update for loading state", () => {
    const html = renderToStaticMarkup(<AnnouncementFeed status="loading" />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Loading announcements. Please wait...");
  });

  it("provides live status update for empty state", () => {
    const html = renderToStaticMarkup(<AnnouncementFeed items={[]} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Announcement feed is empty. No messages available.");
  });

  it("provides assertive live alert update for error state with retry guidance", () => {
    const html = renderToStaticMarkup(
      <AnnouncementFeed error="Server timed out" />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain("Press Retry Synchronization to attempt loading again.");
  });

  it("provides live count update when announcements are loaded", () => {
    const html = renderToStaticMarkup(
      <AnnouncementFeed items={sampleAnnouncements} />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("2 announcements loaded.");
    expect(html).toContain("Course registration closes Friday");
  });
});

type ButtonElement = React.ReactElement<{
  "aria-label"?: string;
  onClick?: () => void;
  [key: string]: unknown;
}>;

/**
 * Helper to recursively inspect a React element tree and find buttons
 */
function findButtons(node: unknown): ButtonElement[] {
  const results: ButtonElement[] = [];

  function traverse(n: unknown) {
    if (!n || typeof n !== "object") return;
    if (React.isValidElement(n)) {
      if (n.type === "button") {
        results.push(n as ButtonElement);
      }
      if (n.props && typeof n.props === "object") {
        const props = n.props as { children?: unknown };
        if (Array.isArray(props.children)) {
          props.children.forEach(traverse);
        } else if (props.children) {
          traverse(props.children);
        }
      }
    }
  }

  traverse(node);
  return results;
}
