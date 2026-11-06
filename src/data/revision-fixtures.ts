import type { MailMessage } from "../mail/contracts";
/** Synthetic revision pair with complete dates and venue changes. */
export const revisionDemoMessages: readonly MailMessage[] = [
  {
    id: "revision-demo-1",
    from: "clubs@example.edu",
    subject: "Workshop registration",
    receivedAt: "2026-11-05T09:00:00Z",
    preview: "Register by 10 November at Seminar Hall A.",
    body: "Register by 10 November 2026 at 5 PM. Venue: Seminar Hall A.",
    headers: {
      "message-id": "<workshop-original@example.edu>",
      "List-ID": "clubs",
    },
    attachments: [],
  },
  {
    id: "revision-demo-2",
    from: "clubs@example.edu",
    subject: "Re: Workshop registration",
    receivedAt: "2026-11-06T09:00:00Z",
    preview: "Updated deadline and venue: 12 November, Seminar Hall B.",
    body: "Register by 12 November 2026 at 5 PM. Venue: Seminar Hall B.",
    headers: {
      "message-id": "<workshop-update@example.edu>",
      "in-reply-to": "<workshop-original@example.edu>",
      "List-ID": "clubs",
    },
    attachments: [],
  },
];
