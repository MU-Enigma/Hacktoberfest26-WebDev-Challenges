# Complaint status timeline (SIG-006)

```tsx
import {
  ComplaintTimeline,
} from "@/components/complaint-timeline";
import type { ComplaintTimelineEvent } from "@/components/complaint-timeline";

const history: ComplaintTimelineEvent[] = [
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
];

<ComplaintTimeline events={history} />
```

The `ComplaintTimeline` component renders a chronological, accessible history of
complaint status changes. It builds on the status indicators from SIG-005.

## Public event contract

Each event exposes exactly three fields:

| Field          | Type     | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `status`       | `string` | Complaint workflow status key                |
| `timestamp`    | `string` | ISO 8601 timestamp of the status change      |
| `publicUpdate` | `string` | Public-facing update text visible to all users |

Any additional properties on the source object are stripped before rendering.
Moderator identity, internal notes, and reporter information are never displayed.

## Behavior

- Events are sorted chronologically by timestamp. Events with equal timestamps
  preserve their original input order.
- Timestamps are formatted deterministically using the configured application
  timezone (`Asia/Kolkata`) and locale (`en-GB`) from `src/config/application.ts`.
- Invalid timestamps display the raw string and sort to the end.
- Empty or unknown status values display **Unknown status** with neutral styling.
- An empty history renders an accessible message: "No status updates yet."

## Accessibility

- The timeline is wrapped in a `<section>` with `aria-label="Complaint status history"`.
- Events use an ordered list (`<ol>`) with semantic list items.
- Timestamps use the `<time>` element with machine-readable `dateTime` attributes.
- Decorative timeline connectors are hidden from assistive technology.
- No interactive controls, tab stops, or live regions are introduced.

## Review example

For local visual review, temporarily render the component in a development page:

```tsx
import { ComplaintTimeline } from "@/components/complaint-timeline";
import type { ComplaintTimelineEvent } from "@/components/complaint-timeline";

const sampleHistory: ComplaintTimelineEvent[] = [
  { status: "submitted", timestamp: "2026-10-10T09:00:00.000Z", publicUpdate: "Your complaint has been received." },
  { status: "acknowledged", timestamp: "2026-10-11T14:30:00.000Z", publicUpdate: "A maintenance team has been notified." },
  { status: "in_progress", timestamp: "2026-10-12T10:15:00.000Z", publicUpdate: "A technician is inspecting the reported area." },
  { status: "resolved", timestamp: "2026-10-14T16:00:00.000Z", publicUpdate: "The issue has been fixed. Thank you for reporting." },
];

export default function TimelinePreview() {
  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
      <ComplaintTimeline events={sampleHistory} />
    </div>
  );
}
```

Remove the temporary route after review; the contribution adds no permanent
example route or navigation item.

Run `npm test -- src/components/complaint-timeline.test.tsx` for component
coverage of single/multi-event histories, chronological ordering, privacy
isolation, missing values, accessibility, and long histories. Run `npm run check`
for all required lint, TypeScript, and unit checks.
