"use client";
import type {
  RevisionGroup,
  RevisionSuggestion,
} from "../announcements/revisions";
import { revisionChanges } from "../announcements/revisions";
import { formatTimestamp } from "../utils/date-time";
import styles from "./announcement-revisions.module.css";
export function RevisionSuggestions({
  suggestions,
  onConfirm,
}: {
  suggestions: readonly RevisionSuggestion[];
  onConfirm: (key: string) => void;
}) {
  if (!suggestions.length) return null;
  return (
    <section
      className={styles.panel}
      aria-label="Possible announcement revisions"
    >
      <h2>Possible revisions</h2>
      <p>
        These messages have similar subjects. Confirm only if they update the
        same announcement.
      </p>
      <ul>
        {suggestions.map((s) => (
          <li key={s.key}>
            <p>
              {s.older.subject} ({formatTimestamp(s.older.receivedAt)}) →{" "}
              {s.newer.subject} ({formatTimestamp(s.newer.receivedAt)})
            </p>
            <button className="classic-button" onClick={() => onConfirm(s.key)}>
              Confirm these are revisions
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
export function AnnouncementRevisionHistory({
  group,
}: {
  group: RevisionGroup;
}) {
  if (group.messages.length < 2) return null;
  return (
    <section
      className={styles.panel}
      aria-label="Announcement revision history"
    >
      <h3>Revision history ({group.messages.length} versions)</h3>
      <p>
        The latest version is shown above. Earlier source messages remain
        available below.
      </p>
      {group.messages.slice(1).map((message, index) => {
        const before = group.messages[index],
          changes = revisionChanges(before, message);
        return (
          <section className={styles.change} key={message.id}>
            <h4>Changes received {formatTimestamp(message.receivedAt)}</h4>
            <p>Compared with {formatTimestamp(before.receivedAt)}</p>
            {changes.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <caption>Changed instructions</caption>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Previous</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((c) => (
                      <tr key={c.field}>
                        <th>{c.field}</th>
                        <td>{c.before}</td>
                        <td>{c.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                No supported instruction changes detected. Review the source
                messages.
              </p>
            )}
          </section>
        );
      })}
      <ol>
        {group.messages.map((message) => (
          <li key={message.id}>
            <details>
              <summary>
                {formatTimestamp(message.receivedAt)} — {message.subject}
              </summary>
              <p>From: {message.from}</p>
              <p className={styles.source}>{message.body}</p>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
