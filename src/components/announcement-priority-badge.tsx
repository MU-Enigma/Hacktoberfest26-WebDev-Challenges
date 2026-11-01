import React from "react";
import type { AnnouncementPriority } from "../mail/contracts";

export interface AnnouncementPriorityBadgeProps {
  /**
   * The priority of the announcement.
   * If missing, null, or unrecognized, safely falls back to 'informational'.
   */
  priority?: AnnouncementPriority | string | null;
  /**
   * Optional custom class names to append.
   */
  className?: string;
  /**
   * Whether the badge is interactive (e.g., clickable filter or chip).
   * When true or when onClick is provided, sets role="button", tabIndex={0},
   * and handles keyboard interaction.
   */
  interactive?: boolean;
  /**
   * Click handler for interactive badges.
   */
  onClick?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
  /**
   * The HTML tag to render. Defaults to 'span'.
   */
  as?: "span" | "button" | "div";
}

/**
 * Standard text label and icon/shape mappings for each announcement priority.
 * Ensures that color is never the only visual differentiator (WCAG 1.4.1).
 */
export const PRIORITY_CONFIG: Record<
  AnnouncementPriority,
  { label: string; icon: string }
> = {
  urgent: { label: "URGENT", icon: "!" },
  action_required: { label: "ACTION REQUIRED", icon: "▶" },
  upcoming: { label: "UPCOMING", icon: "◷" },
  informational: { label: "INFO", icon: "ℹ" },
} as const;

/**
 * Resolves a raw priority value safely to a canonical AnnouncementPriority.
 * Unknown strings, inherited properties (__proto__, constructor), null, or
 * undefined always fall back to 'informational'.
 */
export function resolvePriority(priority?: string | null): AnnouncementPriority {
  if (priority && Object.hasOwn(PRIORITY_CONFIG, priority)) {
    return priority as AnnouncementPriority;
  }
  return "informational";
}

/**
 * Reusable Announcement Priority Badge component.
 *
 * Distinguishes urgent, action required, upcoming, and informational announcements
 * using visible text, distinct icons/shapes, and high-contrast tones.
 * Safely falls back to 'informational' for missing or unrecognized priority values.
 */
export function AnnouncementPriorityBadge({
  priority: rawPriority,
  className = "",
  interactive = false,
  onClick,
  as: Component = "span",
}: AnnouncementPriorityBadgeProps) {
  const priority = resolvePriority(rawPriority);
  const { label, icon } = PRIORITY_CONFIG[priority];
  const isInteractive = interactive || Boolean(onClick);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isInteractive && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  const badgeClasses = [
    "announcement-badge",
    `priority-${priority}`,
    isInteractive ? "announcement-badge-interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={badgeClasses}
      data-priority={priority}
      role={isInteractive && Component !== "button" ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <span className="badge-icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="sr-only">Priority: </span>
        {label}
      </span>
    </Component>
  );
}

/**
 * Alias export for component naming convenience.
 */
export const AnnouncementBadge = AnnouncementPriorityBadge;

