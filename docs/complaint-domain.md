# Complaint domain (SIG-201)

`src/complaints/domain.ts` defines the nine approved operational categories and five canonical statuses. The existing category indicator imports this catalog. Its presentation-only `in_review` legacy fallback is retained; new domain records reject that value rather than guessing a migration.

## Submission boundary

`createComplaint(input, { id, reporterId, now })` validates unknown request data, trims required text, and starts a submitted record with an initial history event. The server supplies the stable ID, authenticated/verified reporter ID, and ISO timestamp. Request-supplied identity, status and history are ignored. Fields have limits: location 200, title 160, description 4,000 characters. Public anonymity is an explicit boolean. Sensitive categories return `OFFICIAL_CHANNEL_REQUIRED`, an official-service destination identifier and guidance, without a complaint object, text or identity. This pure module never writes or logs reports; callers must persist only `ok: true` results. The UI can resolve the destination to its institution's official service; no URL is invented here.

Validation is category-based. It does not determine whether arbitrary free text contains a named-person allegation, medical details or identifying information. The submission/moderation layers must enforce those boundaries and validate session permissions before storing or publishing content.

## Transition policy

| From | Allowed next states |
| --- | --- |
| submitted | acknowledged, closed |
| acknowledged | in_progress, closed |
| in_progress | resolved, closed |
| resolved | closed |
| closed | none |

Self-transitions, skipped steps, reopen attempts and unknown states fail with stable codes. Every transition needs a public update. Closing before resolution needs a public closure reason, included in the status update. Moderator identity and optional internal note stay private. ISO timestamps must include a zone, must be real dates, and cannot precede the previous update. This conservative policy should be extended explicitly if reopening is introduced later.

`transitionComplaint` returns a new record and appends an event. The moderator workflow (#21) owns authorization, optimistic concurrency, storage and audit persistence; callers must not treat a passed moderator ID as proof of authorization. Those functions remain independent of any framework or database.

## Example response contracts

Given a synthetic reporter `student-demo` and moderator event with an internal note, `toPublicComplaint(record)` returns only:

```json
{
  "id": "complaint-demo", "category": "wifi", "location": "Hostel A common area",
  "title": "Intermittent Wi-Fi", "description": "Connection drops in the shared common area.",
  "status": "acknowledged", "createdAt": "2026-10-27T09:00:00Z", "updatedAt": "2026-10-27T10:00:00Z",
  "history": [
    { "status": "submitted", "at": "2026-10-27T09:00:00Z", "publicUpdate": "Report submitted." },
    { "status": "acknowledged", "at": "2026-10-27T10:00:00Z", "publicUpdate": "Maintenance notified." }
  ]
}
```

`toModeratorComplaint(record)` additionally includes `reporterId`, `publicAnonymous`, and allowed moderator-only fields (`moderatorId`, `internalNote`) in history. Both mappers use explicit field allowlists and detached history entries; extra properties are not forwarded. Reporter identity is withheld publicly even when anonymity is false until an explicit public-profile policy exists. Free-text fields still require content moderation before public exposure.

Tests cover every category, all 25 status pairs, sensitive redirects, malformed input, length limits, injected fields, invalid/backdated timestamps, closure reasons, both anonymity settings, unknown-field exclusion and response immutability. All examples are synthetic.
