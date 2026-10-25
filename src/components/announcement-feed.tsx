"use client";

import React, { useState } from "react";

import type { Announcement, AnnouncementPriority } from "../mail/contracts";
export type { Announcement, AnnouncementPriority } from "../mail/contracts";
import { AttachmentRow } from "./attachment-row";
import { formatRelativeTime } from "../utils/date-time";

export type AnnouncementFeedStatus = "loading" | "empty" | "error" | "ready";

/**
 * Sanitizes any error message or error object to ensure that provider tokens,
 * OAuth credentials, passwords, raw server stack traces, and internal database/file
 * errors are never exposed to students or assistive technologies.
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred while retrieving announcements. Please retry.";
  }

  // Extract raw text from Error, object, or string
  let raw = "";
  if (typeof error === "string") {
    raw = error;
  } else if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === "string") {
      raw = errorObj.message;
    } else if (typeof errorObj.error === "string") {
      raw = errorObj.error;
    } else {
      raw = JSON.stringify(error);
    }
  } else {
    raw = String(error);
  }

  const lower = raw.toLowerCase();

  // 1. Recognize database / SQL errors first to prevent data structure leaks
  if (
    lower.includes("select ") ||
    lower.includes("insert into") ||
    lower.includes("sql") ||
    lower.includes("syntax error") ||
    lower.includes("postgres") ||
    lower.includes("mysql") ||
    lower.includes("mongodb") ||
    lower.includes("sqlite") ||
    lower.includes("database error")
  ) {
    return "Unable to query announcement records. An internal service error occurred.";
  }

  // 2. Recognize network connection drops & timeouts
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("etimedout")
  ) {
    return "The request timed out while contacting the announcement provider. Please check your network and retry.";
  }

  if (
    lower.includes("econnrefused") ||
    lower.includes("econnreset") ||
    lower.includes("enotfound") ||
    lower.includes("ehostunreach") ||
    lower.includes("enetunreach") ||
    lower.includes("socket hang up") ||
    lower.includes("network error") ||
    lower.includes("failed to fetch") ||
    lower.includes("connection refused")
  ) {
    return "Unable to establish a connection with the mailbox server. Please check your network connection and retry.";
  }

  // 3. Recognize server 5xx and internal server errors
  if (
    lower.includes("500") ||
    lower.includes("502") ||
    lower.includes("503") ||
    lower.includes("504") ||
    lower.includes("internal server error") ||
    lower.includes("bad gateway") ||
    lower.includes("service unavailable")
  ) {
    return "The announcement mailbox service is temporarily unavailable. Please retry shortly.";
  }

  // 4. Recognize authentication / authorization failures (and redact any provider tokens)
  if (
    lower.includes("bearer") ||
    lower.includes("oauth") ||
    lower.includes("access_token") ||
    lower.includes("refresh_token") ||
    lower.includes("id_token") ||
    lower.includes("api_key") ||
    lower.includes("apikey") ||
    lower.includes("client_secret") ||
    lower.includes("unauthorized") ||
    lower.includes("401") ||
    lower.includes("unauthenticated") ||
    lower.includes("invalid_grant") ||
    lower.includes("invalid_token") ||
    lower.includes("token expired") ||
    lower.includes("token revoked")
  ) {
    return "Mailbox authentication session expired or is invalid. Please reconnect your mailbox.";
  }

  if (lower.includes("forbidden") || lower.includes("403") || lower.includes("access denied")) {
    return "Access to the requested mailbox announcements was denied. Delegated permissions may be insufficient.";
  }

  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("too many requests")) {
    return "Too many requests to the mailbox provider. Please wait a moment before retrying.";
  }

  // 5. Recognize runtime exceptions, unhandled rejections, and raw programming errors
  if (
    lower.includes("typeerror") ||
    lower.includes("referenceerror") ||
    lower.includes("syntaxerror") ||
    lower.includes("rangeerror") ||
    lower.includes("evalerror") ||
    lower.includes("urierror") ||
    lower.includes("assertionerror") ||
    lower.includes("cannot read propert") ||
    lower.includes("uncaught")
  ) {
    return "An internal processing error occurred while parsing announcements. Please retry.";
  }

  // 6. Check for stack traces, filesystem paths, or internal server module names
  if (
    raw.includes("\n    at ") ||
    lower.includes("node_modules") ||
    lower.includes("node:") ||
    /(?:\/[a-zA-Z0-9._-]+)+:[0-9]+:[0-9]+/.test(raw) ||
    /[A-Z]:\\[a-zA-Z0-9._\\-]+/i.test(raw)
  ) {
    return "An unexpected server error occurred while loading announcements. Please retry.";
  }

  // 7. Check for token formats (Google ya29.*, JWTs, AWS keys, GitHub tokens, credentials)
  if (
    /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/.test(raw) ||
    /ya29\.[A-Za-z0-9-_]+/.test(raw) ||
    /ghp_[A-Za-z0-9]{36}/.test(raw) ||
    /AKIA[0-9A-Z]{16}/.test(raw) ||
    /(access_token|refresh_token|api_key|client_secret|password|secret|authorization|credential)[=:\s]+["']?[^\s,'"&]+["']?/i.test(raw)
  ) {
    return "Mailbox authentication session expired or is invalid. Please reconnect your mailbox.";
  }

  // 8. Raw JSON payloads or bracketed dumps
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return "An unexpected error occurred while loading announcements. Please retry.";
  }

  return trimmed;
}

export type AnnouncementSkeletonRowProps = {
  className?: string;
};

/**
 * Stable skeleton row designed to match the exact dimensions, padding, margins,
 * and line-heights of an announcement row to prevent Cumulative Layout Shift (CLS).
 */
export function AnnouncementSkeletonRow({ className }: AnnouncementSkeletonRowProps) {
  return (
    <div
      className={`announcement-row announcement-skeleton-row ${className || ""}`}
      aria-hidden="true"
      data-testid="announcement-skeleton-row"
    >
      <div className="announcement-row-header">
        <span className="skeleton-block skeleton-badge" />
        <span className="skeleton-block skeleton-sender" />
        <span className="skeleton-block skeleton-time" />
      </div>
      <div className="skeleton-block skeleton-subject" />
      <div className="skeleton-preview-group">
        <span className="skeleton-block skeleton-preview-line-1" />
        <span className="skeleton-block skeleton-preview-line-2" />
      </div>
    </div>
  );
}

export type AnnouncementFeedSkeletonProps = {
  count?: number;
  className?: string;
};

/**
 * Loading state container rendering stable skeleton rows with accessible screen reader announcements.
 */
export function AnnouncementFeedSkeleton({
  count = 3,
  className,
}: AnnouncementFeedSkeletonProps) {
  return (
    <div
      className={`announcement-feed-loading ${className || ""}`}
      role="status"
      aria-busy="true"
      aria-label="Loading announcements"
      data-testid="announcement-feed-skeleton"
    >
      <div className="sr-only">Loading announcements. Please wait...</div>
      {Array.from({ length: count }, (_, index) => (
        <AnnouncementSkeletonRow key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

export type AnnouncementFeedEmptyProps = {
  onLoadMockMailbox?: () => void;
  onConnectMailbox?: () => void;
  className?: string;
};

/**
 * Empty state explaining why announcements are absent and how to connect or load the mock mailbox.
 */
export function AnnouncementFeedEmpty({
  onLoadMockMailbox,
  onConnectMailbox,
  className,
}: AnnouncementFeedEmptyProps) {
  return (
    <section
      className={`feed-state-box empty-state ${className || ""}`}
      aria-label="No announcements available"
      data-testid="announcement-feed-empty"
    >
      <div className="state-icon-badge empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v12H4z" />
          <path d="m5 7 7 5 7-5" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>

      <div className="state-content">
        <div className="state-header-line">
          <p className="status-label">FEED STATUS: 0 RECORDS</p>
          <span className="system-pill">STANDBY</span>
        </div>
        <h2>NO ANNOUNCEMENTS IN FEED</h2>
        <p className="state-description">
          The announcement feed is currently unpopulated. In SIGNAL, announcements
          are ingested from connected student email accounts using read-only delegated
          access, filtering out general inbox noise.
        </p>

        <div className="guidance-grid">
          <div className="guidance-card">
            <span className="guidance-step" aria-hidden="true">01</span>
            <div>
              <h3>Load Synthetic Mock Mailbox</h3>
              <p>
                Populate this feed with safe, deterministic mock announcements (course
                deadlines, library notices, and club alerts) without needing credentials.
              </p>
              {onLoadMockMailbox && (
                <button
                  type="button"
                  className="classic-button load-mock-button"
                  onClick={onLoadMockMailbox}
                  aria-label="Load synthetic mock mailbox records"
                >
                  Load Mock Mailbox
                </button>
              )}
            </div>
          </div>

          <div className="guidance-card">
            <span className="guidance-step" aria-hidden="true">02</span>
            <div>
              <h3>Connect Live Campus Mailbox</h3>
              <p>
                To sync real announcements, link your institutional account via
                delegated OAuth 2.0. SIGNAL only requests read-only mail scopes.
              </p>
              {onConnectMailbox && (
                <button
                  type="button"
                  className="classic-button connect-mailbox-button"
                  onClick={onConnectMailbox}
                  aria-label="Open campus mailbox connection instructions"
                >
                  Connect Mailbox...
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export type AnnouncementFeedErrorProps = {
  error: unknown;
  onRetry?: () => void;
  onLoadMockMailbox?: () => void;
  className?: string;
  autoFocusRetry?: boolean;
};

/**
 * Error state explaining what failed (with sanitized copy) and exposing a retry action.
 */
export function AnnouncementFeedError({
  error,
  onRetry,
  onLoadMockMailbox,
  className,
  autoFocusRetry = false,
}: AnnouncementFeedErrorProps) {
  const safeMessage = sanitizeErrorMessage(error);

  return (
    <section
      className={`feed-state-box error-state ${className || ""}`}
      role="alert"
      aria-live="assertive"
      data-testid="announcement-feed-error"
    >
      <div className="state-icon-badge error-icon" aria-hidden="true">
        <span>!</span>
      </div>

      <div className="state-content">
        <div className="state-header-line">
          <p className="status-label error-label">FEED STATUS: SYNC FAILURE</p>
          <span className="error-pill">ALERT</span>
        </div>
        <h2>UNABLE TO LOAD ANNOUNCEMENTS</h2>
        <div className="error-message-box">
          <p className="error-message-text">{safeMessage}</p>
        </div>
        <p className="state-description">
          The announcement feed could not complete synchronization with the mailbox provider.
          This can happen when network connectivity is lost, provider response times out,
          or mailbox authentication expires.
        </p>

        <div className="state-actions">
          {onRetry && (
            <button
              type="button"
              className="classic-button retry-button"
              onClick={onRetry}
              autoFocus={autoFocusRetry}
              aria-label="Retry announcement synchronization"
            >
              Retry Synchronization
            </button>
          )}
          {onLoadMockMailbox && (
            <button
              type="button"
              className="classic-button secondary-action-btn"
              onClick={onLoadMockMailbox}
              aria-label="Switch to local mock mailbox fallback"
            >
              Fallback: Load Mock Mailbox
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export type AnnouncementRowProps = {
  item: Announcement;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
};

/**
 * Individual announcement row for displaying loaded messages.
 * Uses distinctive badges (with both icon and text) and accent borders so
 * urgent and action-required items are immediately distinguishable without relying on color alone.
 */
export function AnnouncementRow({
  item,
  isSelected = false,
  onSelect,
  className,
}: AnnouncementRowProps) {
  const priority = item.priority || "informational";
  const priorityConfig: Record<
    AnnouncementPriority,
    { label: string; icon: string }
  > = {
    urgent: { label: "URGENT", icon: "!" },
    action_required: { label: "ACTION REQUIRED", icon: "▶" },
    upcoming: { label: "UPCOMING", icon: "◷" },
    informational: { label: "INFO", icon: "ℹ" },
  };

  const { label, icon } = priorityConfig[priority] || priorityConfig.informational;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onSelect) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className={`announcement-row ${isSelected ? "announcement-row-selected" : ""} ${className || ""}`}
      data-testid={`announcement-item-${item.id}`}
      data-priority={priority}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={onSelect ? handleKeyDown : undefined}
    >
      <div className="announcement-row-header">
        <span
          className={`announcement-badge priority-${priority}`}
          data-priority={priority}
        >
          <span className="badge-icon" aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </span>
        <span className="announcement-sender" title={item.from}>
          {item.from}
        </span>
        <time className="announcement-time" dateTime={item.receivedAt}>
          {new Date(item.receivedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      <h3 className="announcement-subject">{item.subject}</h3>
      <p className="announcement-preview">{item.preview}</p>
      <div className="announcement-row-meta">
        {item.category && (
          <span className="announcement-meta-tag">{item.category}</span>
        )}
        {item.actions && item.actions.length > 0 && (
          <span className="announcement-meta-tag tag-action">
            ⚡ Action required
          </span>
        )}
        {item.attachments && item.attachments.length > 0 && (
          <span className="announcement-meta-tag tag-attachment">
            📎 {item.attachments.length} {item.attachments.length === 1 ? "attachment" : "attachments"}
          </span>
        )}
      </div>
    </article>
  );
}

export type AnnouncementDetailProps = {
  item: Announcement | null;
  onClose?: () => void;
  className?: string;
};

/**
 * Detailed announcement view displaying complete message body, deadlines, and attachments.
 */
export function AnnouncementDetail({
  item,
  onClose,
  className,
}: AnnouncementDetailProps) {
  if (!item) {
    return (
      <aside
        className={`announcement-detail-placeholder ${className || ""}`}
        data-testid="announcement-detail-placeholder"
      >
        <span className="announcement-detail-placeholder-icon" aria-hidden="true">
          📋
        </span>
        <h3>SELECT AN ANNOUNCEMENT</h3>
        <p>
          Select an announcement from the feed to view full details, deadlines,
          and safe attachments.
        </p>
      </aside>
    );
  }

  const priority = item.priority || "informational";
  const priorityLabels: Record<AnnouncementPriority, string> = {
    urgent: "URGENT",
    action_required: "ACTION REQUIRED",
    upcoming: "UPCOMING",
    informational: "INFO",
  };

  let relativeTimeStr = "";
  try {
    relativeTimeStr = formatRelativeTime(item.receivedAt);
  } catch {
    relativeTimeStr = new Date(item.receivedAt).toLocaleDateString();
  }

  return (
    <aside
      className={`announcement-detail-card ${className || ""}`}
      data-testid="announcement-detail-card"
      aria-label={`Details for announcement: ${item.subject}`}
    >
      <div className="announcement-detail-titlebar">
        <span>ANNOUNCEMENT DETAILS — {item.id}</span>
        {onClose && (
          <button
            type="button"
            className="announcement-detail-close-btn"
            onClick={onClose}
            aria-label="Back to announcements list"
          >
            ← Back to feed
          </button>
        )}
      </div>

      <div className="announcement-detail-content">
        <div className="announcement-detail-header-row">
          <span className={`announcement-badge priority-${priority}`}>
            {priorityLabels[priority]}
          </span>
          {item.category && (
            <span className="announcement-meta-tag">{item.category}</span>
          )}
          <span className="announcement-detail-time" title={item.receivedAt}>
            {relativeTimeStr}
          </span>
        </div>

        <div className="announcement-detail-sender">
          <strong>From:</strong> {item.from}
        </div>

        <h2 className="announcement-detail-subject">{item.subject}</h2>

        {item.actions && item.actions.length > 0 && (
          <div className="announcement-action-callout" data-testid="announcement-actions-box">
            <h4>⚡ Required Actions</h4>
            {item.actions.map((act) => (
              <div key={act.id} className="announcement-action-item">
                <p>{act.text}</p>
                {act.deadline && (
                  <span className="announcement-action-deadline">
                    Due: {act.deadline}
                  </span>
                )}
                {act.needsConfirmation && (
                  <span className="announcement-meta-tag tag-action">
                    Confirmation required
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="announcement-detail-body">
          {item.body || item.preview}
        </div>

        {item.attachments && item.attachments.length > 0 && (
          <div className="announcement-detail-attachments-box">
            <h4 className="announcement-detail-attachments-title">
              Attachments ({item.attachments.length})
            </h4>
            <div className="announcement-attachments-list" role="list">
              {item.attachments.map((att) => (
                <AttachmentRow key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export type AnnouncementFeedProps = {
  status?: AnnouncementFeedStatus;
  items?: readonly Announcement[];
  selectedId?: string | null;
  onSelectAnnouncement?: (announcement: Announcement | null) => void;
  pageSize?: number;
  error?: unknown;
  onRetry?: () => void;
  onLoadMockMailbox?: () => void;
  onConnectMailbox?: () => void;
  skeletonCount?: number;
  className?: string;
  autoFocusRetry?: boolean;
};

/**
 * Main Announcement Feed component coordinating Loading, Empty, Error, and Loaded states.
 * Provides accessible status updates via ARIA live regions, master-detail selection,
 * scroll-preserving pagination, and responsive layout.
 */
export function AnnouncementFeed({
  status: explicitStatus,
  items = [],
  selectedId: controlledSelectedId,
  onSelectAnnouncement,
  pageSize = 5,
  error,
  onRetry,
  onLoadMockMailbox,
  onConnectMailbox,
  skeletonCount = 3,
  className,
  autoFocusRetry,
}: AnnouncementFeedProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(pageSize);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const selectedItem = items.find((i) => i.id === selectedId) || null;

  // Determine effective status
  let effectiveStatus: AnnouncementFeedStatus = "ready";

  if (explicitStatus) {
    effectiveStatus = explicitStatus;
  } else if (error) {
    effectiveStatus = "error";
  } else if (items.length === 0) {
    effectiveStatus = "empty";
  }

  // Derive status update text for screen readers
  let screenReaderMessage = "";
  if (effectiveStatus === "loading") {
    screenReaderMessage = "Loading announcements. Please wait...";
  } else if (effectiveStatus === "empty") {
    screenReaderMessage =
      "Announcement feed is empty. No messages available. Connect a campus mailbox or click Load Mock Mailbox to test.";
  } else if (effectiveStatus === "error") {
    screenReaderMessage = `Error: ${sanitizeErrorMessage(error)}. Press Retry Synchronization to attempt loading again.`;
  } else {
    screenReaderMessage = `${items.length} announcement${items.length === 1 ? "" : "s"} loaded.`;
  }

  const handleSelect = (item: Announcement) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(item);
    } else {
      setInternalSelectedId(item.id);
    }
  };

  const handleCloseDetail = () => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(null);
    } else {
      setInternalSelectedId(null);
    }
  };

  const handleLoadMore = () => {
    // Appends the next batch of items to the list, strictly preserving scroll position in the DOM
    setVisibleCount((prev) => prev + pageSize);
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div
      className={`announcement-feed ${className || ""}`}
      data-status={effectiveStatus}
      data-testid="announcement-feed"
    >
      {/* Dynamic Screen Reader Announcement Region */}
      <div
        role={effectiveStatus === "error" ? "alert" : "status"}
        aria-live={effectiveStatus === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        className="sr-only"
        data-testid="feed-sr-status"
      >
        {screenReaderMessage}
      </div>

      {effectiveStatus === "loading" && (
        <AnnouncementFeedSkeleton count={skeletonCount} />
      )}

      {effectiveStatus === "empty" && (
        <AnnouncementFeedEmpty
          onLoadMockMailbox={onLoadMockMailbox}
          onConnectMailbox={onConnectMailbox}
        />
      )}

      {effectiveStatus === "error" && (
        <AnnouncementFeedError
          error={error}
          onRetry={onRetry}
          onLoadMockMailbox={onLoadMockMailbox}
          autoFocusRetry={autoFocusRetry}
        />
      )}

      {effectiveStatus === "ready" && items.length > 0 && (
        <div
          className={`announcement-feed-layout ${selectedItem ? "has-selected" : ""}`}
          data-testid="announcement-feed-layout"
        >
          <div className="announcement-feed-column-master">
            <div className="announcement-list" data-testid="announcement-list">
              {visibleItems.map((item) => (
                <AnnouncementRow
                  item={item}
                  key={item.id}
                  isSelected={item.id === selectedId}
                  onSelect={() => handleSelect(item)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="announcement-pagination">
                <button
                  type="button"
                  className="classic-button announcement-load-more-btn"
                  onClick={handleLoadMore}
                  data-testid="announcement-load-more-btn"
                  aria-label={`Load more announcements, currently showing ${visibleItems.length} of ${items.length}`}
                >
                  Load More Announcements (showing {visibleItems.length} of {items.length})
                </button>
                <span className="announcement-pagination-info">
                  {items.length - visibleItems.length} more remaining
                </span>
              </div>
            )}
          </div>

          <div className="announcement-feed-column-detail">
            <AnnouncementDetail
              item={selectedItem}
              onClose={handleCloseDetail}
            />
          </div>
        </div>
      )}
    </div>
  );
}
