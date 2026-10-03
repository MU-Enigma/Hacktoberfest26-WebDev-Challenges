# SIGNAL architecture

This document records the stable boundaries supplied by the maintainer scaffold. Individual challenge issues define the implementation inside them.

## System shape

SIGNAL is a single Next.js application using the App Router and TypeScript. Server-only code belongs under `src/server`; provider adapters belong under `src/providers`; reusable domain rules should not import React. UI code must not receive OAuth tokens or raw provider credentials.

```text
Provider adapter -> normalized mail contract -> announcement rules -> server API -> UI
Student input -> complaint domain/service -> persistence -> moderated API -> UI
```

The normalized contracts and complaint domain do not exist yet on purpose: SIG-101 and SIG-201 own those decisions.

## Mock-first rule

`MAIL_PROVIDER=mock` is the default. Mock mode must be deterministic, work offline after dependencies are installed, and remain available in development, tests, CI, previews, and the public synthetic-data demo. Real providers implement the same boundary and must never become prerequisites for unrelated work.

The starter fixtures under `src/data/fixtures` are synthetic source material, not the final normalized domain shape. Extend them only with invented data.

## Mail provider boundary

The provider layer is read-only. A provider may authenticate, list a bounded message window, fetch permitted message fields, and maintain an incremental cursor. It may not send, edit, or delete mail. Provider-specific payloads stop at the adapter boundary; the rest of the application consumes the contract created in SIG-101.

Microsoft Outlook is release-required. Gmail is a stretch adapter and external public OAuth verification is not a release gate.

## Complaint privacy boundary

Public complaint views may show operational details, status, public moderator updates, and anonymous aggregate confirmation counts. Verified reporter identity, private moderator notes, authorization data, and security metadata stay server-side. Anonymous public display does not mean the system loses the private reporter relationship.

The accepted categories exclude sensitive personal grievances. Do not widen them without organizer approval.

## Persistence

Prisma and a local SQLite datasource provide the maintainer database scaffold. SIG-201 owns the first domain models and migration. Production database selection can change later without changing the domain contracts; do not make provider adapters depend directly on Prisma-generated types.

## Tests

- Unit tests: deterministic domain rules, parsers, state transitions, privacy projections.
- Component tests: interaction, keyboard behavior, and accessible names.
- Integration tests: adapters behind fakes, persistence, authorization, redaction.
- End-to-end tests: only release-critical mock-mode journeys until a provider-specific issue explicitly requires test-mode OAuth evidence.

Never record real mailbox or complaint data in snapshots, traces, screenshots, or uploaded CI artifacts.
