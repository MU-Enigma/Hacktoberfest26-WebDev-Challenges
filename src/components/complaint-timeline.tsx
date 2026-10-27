import { APP_LOCALE, APP_TIME_ZONE } from "../config/application";
import { ComplaintStatusIndicator } from "./complaint-indicators";
import styles from "./complaint-timeline.module.css";

/**
 * Public fields that are safe to display in the complaint status timeline.
 * This is an explicit allowlist — only these properties may reach the DOM.
 * Any additional runtime properties on the source object are ignored.
 */
export type ComplaintTimelineEvent = {
  /** Complaint workflow status key (e.g. "submitted", "acknowledged"). */
  status: string;
  /** ISO 8601 timestamp of the status change. */
  timestamp: string;
  /** Public-facing update text visible to all users. */
  publicUpdate: string;
};

/**
 * Extracts only the allowed public fields from an event-like object.
 * This prevents moderator IDs, internal notes, and other private metadata
 * from being accidentally spread into the DOM or serialized into output.
 */
function sanitizeEvent(event: ComplaintTimelineEvent): ComplaintTimelineEvent {
  return {
    status: String(event.status ?? ""),
    timestamp: String(event.timestamp ?? ""),
    publicUpdate: String(event.publicUpdate ?? ""),
  };
}

/**
 * Sort events chronologically by timestamp (ascending).
 * Events with equal or invalid timestamps preserve their original order.
 */
function sortChronologically(
  events: readonly ComplaintTimelineEvent[],
): ComplaintTimelineEvent[] {
  return [...events]
    .map((event, index) => ({ event: sanitizeEvent(event), index }))
    .sort((a, b) => {
      const timeA = new Date(a.event.timestamp).getTime();
      const timeB = new Date(b.event.timestamp).getTime();
      if (Number.isNaN(timeA) && Number.isNaN(timeB)) return a.index - b.index;
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;
      if (timeA !== timeB) return timeA - timeB;
      return a.index - b.index;
    })
    .map(({ event }) => event);
}

/**
 * Formats an ISO 8601 timestamp to a human-readable date-time string.
 * Returns the raw string if the date is invalid.
 */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type ComplaintTimelineProps = {
  /** Chronological history of complaint status changes. */
  events: readonly ComplaintTimelineEvent[];
};

/**
 * Displays a chronological timeline of complaint status changes.
 *
 * Renders only explicitly approved public fields: status, timestamp, and
 * public update text. Private metadata such as moderator identity and
 * internal notes are never accepted or rendered.
 *
 * Uses semantic ordered list markup with `<time>` elements for timestamps.
 */
export function ComplaintTimeline({ events }: ComplaintTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <section className={styles.timeline} aria-label="Complaint status history">
        <p className={styles.empty}>No status updates yet.</p>
      </section>
    );
  }

  const sorted = sortChronologically(events);

  return (
    <section className={styles.timeline} aria-label="Complaint status history">
      <ol className={styles.list}>
        {sorted.map((event, index) => (
          <li key={`${event.timestamp}-${index}`} className={styles.event}>
            <span className={styles.connector} aria-hidden="true" />
            <div className={styles.content}>
              <div className={styles.header}>
                <ComplaintStatusIndicator status={event.status} />
                <time
                  className={styles.timestamp}
                  dateTime={event.timestamp}
                >
                  {formatTimestamp(event.timestamp)}
                </time>
              </div>
              <p className={styles.update}>{event.publicUpdate}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
