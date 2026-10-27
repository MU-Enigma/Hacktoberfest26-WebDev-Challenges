import styles from "./complaint-indicators.module.css";

import { complaintCategories as categories } from "../complaints/domain";

type Tone = "neutral" | "pending" | "active" | "success" | "closed";
type StatusIndicator = { label: string; symbol: string; tone: Tone };

const statuses = {
  submitted: { label: "Submitted", symbol: "○", tone: "pending" },
  acknowledged: { label: "Acknowledged", symbol: "◔", tone: "active" },
  in_progress: { label: "In progress", symbol: "↻", tone: "active" },
  resolved: { label: "Resolved", symbol: "✓", tone: "success" },
  closed: { label: "Closed", symbol: "■", tone: "closed" },
  // The starter fixtures still use this legacy value. Display it without
  // guessing which canonical workflow state it should become.
  in_review: { label: "In review", symbol: "○", tone: "neutral" },
} as const satisfies Record<string, StatusIndicator>;

function Indicator({
  kind,
  label,
  symbol,
  tone = "neutral",
}: {
  kind: "Category" | "Status";
  label: string;
  symbol: string;
  tone?: Tone;
}) {
  return (
    <span className={`${styles.indicator} ${styles[tone]}`} data-tone={tone}>
      <span className={styles.symbol} aria-hidden="true">{symbol}</span>
      <span>
        <span className={styles.visuallyHidden}>{kind}: </span>
        {label}
      </span>
    </span>
  );
}

/** Presentation only: unknown values never become categories or raw UI text. */
export function ComplaintCategoryIndicator({ category }: { category?: string | null }) {
  const label = category && Object.hasOwn(categories, category)
    ? categories[category as keyof typeof categories]
    : "Unknown category";
  return <Indicator kind="Category" label={label} symbol="◇" />;
}

/** Static text, not an interactive control or an unsolicited live region. */
export function ComplaintStatusIndicator({ status }: { status?: string | null }) {
  const indicator: StatusIndicator = status && Object.hasOwn(statuses, status)
    ? statuses[status as keyof typeof statuses]
    : { label: "Unknown status", symbol: "?", tone: "neutral" };
  return <Indicator kind="Status" {...indicator} />;
}
