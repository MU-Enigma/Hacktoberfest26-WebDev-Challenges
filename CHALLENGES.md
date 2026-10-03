# SIGNAL challenge catalog

> **Contributors do not need to read this file.** Choose a published GitHub issue and follow `CONTRIBUTING.md`. This catalog is only for organizers creating issues.

Preview the opening batch with `npm run challenges:publish`. After checking the list, an organizer with GitHub CLI can add `-- --apply --repo MU-Enigma/Hacktoberfest26-WebDev-Challenges` to publish it. Later batches are named `contracts`, `stabilized`, and `final`.

## Product boundary

SIGNAL has two focused modules.

### Announcements

- Connect a Microsoft Outlook or Gmail account through OAuth.
- Detect and normalize announcement-style email.
- Show announcements in a clean feed.
- Extract deadlines and required actions.
- Group related revisions and highlight changes.
- Search, filter, save, snooze, and mark announcements handled.

### Operational complaints

- Submit a complaint about Wi-Fi, water, electricity, washrooms, laundry, cleanliness, broken facilities, hostel maintenance, or queues.
- Track complaint status.
- Suggest and combine duplicates.
- Allow moderators to review and update complaints.
- Keep the verified reporter private when public anonymity is selected.

### Explicitly outside scope

- Juno, ERP, attendance, grades, timetables, or faculty-controlled academic data
- Placement and internship information
- Transport or cab pooling
- Lost and found
- Payments
- Public posting of raw email bodies
- Email passwords or basic-authentication credentials
- Sending, deleting, or modifying a user's email
- Harassment, assault, medical, disciplinary, or named-person complaints
- Live integration with another campus product

## 2. Release requirements

The project is complete when:

- Mock mailbox mode works for every contributor and in CI.
- At least one real mailbox adapter works end to end. Microsoft Outlook is the priority.
- Announcement feed, search, classification, deadlines, and handled state work.
- Operational complaints can be submitted, moderated, and tracked.
- Mail and complaint privacy boundaries have automated tests.
- Critical user journeys pass end-to-end tests.
- The application is responsive, keyboard accessible, documented, and works locally in mock mode.

Gmail is an advanced parallel adapter. Its external OAuth verification is not required for judging; test-mode integration and correct adapter behavior are sufficient.

## 3. Contribution rules

1. Comment /claim on an available issue.
2. Wait for assignment before starting.
3. Claim only one core or advanced issue at a time.
4. Show progress within 72 hours or release the issue.
5. Create a focused branch: challenge/<issue-id>-short-name.
6. Link the issue in the pull request.
7. Include tests and evidence required by the issue.
8. Disclose material AI assistance in the pull request.
9. Never commit tokens, email data, passwords, or real complaint information.
10. Do not approve or merge your own pull request.

Every merged PR must pass linting, type checking, tests, and accessibility checks where relevant.

## 4. Labels to create

### Difficulty

- level:starter
- level:core
- level:advanced
- level:final

### Track

- track:announcements
- track:complaints
- track:mail-provider
- track:quality
- track:documentation

### Work type

- type:frontend
- type:backend
- type:full-stack
- type:testing
- type:accessibility
- type:security
- type:devops

### Size and status

- size:xs, size:s, size:m, size:l
- status:available, status:claimed, status:blocked, status:review
- good first issue
- release:required
- release:stretch

## 5. Issue format

Every published challenge should retain this structure:

markdown

## Goal

Describe the user-visible or engineering outcome.

## Acceptance criteria

- Observable requirement
- Observable requirement

## Required evidence

- Tests, screenshots, recordings, or API examples

## Out of scope

- Work deliberately excluded from this issue

---

# Track A — Starter challenges

These issues should be independent, well documented, and safe for first-time contributors.

## SIG-001 — Build the announcement priority badge

_Labels:_ level:starter, track:announcements, type:frontend, size:xs, good first issue

_Depends on:_ Shared UI tokens and announcement fixture type

### Goal

Create a reusable badge for urgent, action required, upcoming, and informational announcements.

### Acceptance criteria

- Each priority has text and an icon or shape; color is not the only signal.
- Unknown priorities fall back safely to informational.
- The component works on light selected surfaces and the dark base surface.
- Focus and hover behavior are documented in the component example.

### Required evidence

- Component tests for every priority and fallback behavior
- Mobile and desktop screenshots

### Out of scope

- Determining an announcement's priority
- Email-provider integration

## SIG-002 — Add announcement loading, empty, and error states

_Labels:_ level:starter, track:announcements, type:frontend, size:s, good first issue

_Depends on:_ Announcement feed shell

### Goal

Make the feed useful when messages are loading, absent, or unavailable.

### Acceptance criteria

- Loading uses stable skeleton rows without layout shift.
- Empty state explains how to connect or load the mock mailbox.
- Error state explains what failed and exposes a retry action.
- Error copy does not expose provider tokens or raw server errors.
- Screen readers receive an appropriate status update.

### Required evidence

- Component tests for all three states
- Keyboard recording or notes for the retry action

## SIG-003 — Create deadline and relative-time utilities

_Labels:_ level:starter, track:announcements, type:testing, size:s, good first issue

_Depends on:_ None

### Goal

Implement consistent human-readable timestamps and deadline states.

### Acceptance criteria

- Supports future, today, overdue, missing, and invalid dates.
- Uses the configured application timezone.
- Does not label a deadline overdue before the exact deadline time.
- Output remains understandable without relying on color.

### Required evidence

- Unit tests covering timezone boundaries, midnight, and invalid values

## SIG-004 — Build the attachment row

_Labels:_ level:starter, track:announcements, type:frontend, size:s, good first issue

_Depends on:_ Normalized attachment fixture

### Goal

Display safe metadata for announcement attachments.

### Acceptance criteria

- Shows filename, type, and formatted size.
- Uses a safe fallback for unknown file types.
- Long filenames wrap or truncate without breaking layout.
- Unsafe external URLs are not rendered as active download links.

### Required evidence

- Component tests for PDF, image, unknown type, and long filename

### Out of scope

- Downloading or scanning attachment content

## SIG-005 — Build complaint category and status indicators

_Labels:_ level:starter, track:complaints, type:frontend, size:xs, good first issue

_Depends on:_ Complaint fixture type

### Goal

Create consistent category and status indicators for operational complaints.

### Acceptance criteria

- Supports every approved operational category.
- Supports submitted, acknowledged, in progress, resolved, and closed.
- Includes accessible text for every state.
- Unknown values use a safe neutral fallback.

### Required evidence

- Component tests for every status and fallback

## SIG-006 — Add the complaint status timeline

_Labels:_ level:starter, track:complaints, type:frontend, size:s, good first issue

_Depends on:_ Complaint status indicators

### Goal

Show a chronological, accessible history of complaint status changes.

### Acceptance criteria

- Displays state, timestamp, and public update text.
- Does not expose moderator identity or internal notes.
- Handles one-event and long histories.
- Uses semantic list or timeline markup.

### Required evidence

- Component tests for short and long histories
- Narrow-screen screenshot

## SIG-007 — Complete a keyboard and focus pass on shared controls

_Labels:_ level:starter, track:quality, type:accessibility, size:s, good first issue

_Depends on:_ Shared Button, Input, Select, Dialog, and Sheet components

### Goal

Ensure shared controls are usable without a mouse.

### Acceptance criteria

- Every control has a visible focus indicator.
- Dialog and sheet focus is trapped and returned correctly.
- Escape closes dismissible overlays.
- Disabled controls are exposed correctly.
- No positive tabindex values are introduced.

### Required evidence

- Automated accessibility tests
- Short keyboard walkthrough in the PR description

## SIG-008 — Validate and improve the contributor quick start

_Labels:_ level:starter, track:documentation, size:s, good first issue

_Depends on:_ Mock mode and initial repository setup

### Goal

Make a fresh contributor able to run mock mode within 15 minutes.

### Acceptance criteria

- Instructions start from a clean clone.
- Required software and versions are explicit.
- No real OAuth credentials are required.
- Common Windows, macOS, and Linux setup failures are covered.
- Resetting mock data is documented.

### Required evidence

- Timed clean-install notes
- Documentation-only PR with corrected commands

---

# Track B — Announcement challenges

## SIG-101 — Define the normalized mail and announcement contracts

_Labels:_ level:core, track:announcements, track:mail-provider, type:backend, size:m, release:required

_Depends on:_ Maintainer repository scaffold

### Goal

Create provider-neutral TypeScript contracts used by mock, Outlook, and Gmail adapters.

### Acceptance criteria

- MailMessage, MailAttachment, Announcement, ActionItem, and MailProvider contracts are documented.
- Provider-specific IDs remain opaque strings.
- Raw provider responses never reach UI components.
- Contracts distinguish raw message data from derived announcement data.
- Fixtures validate against the contracts.

### Required evidence

- Contract tests and example fixtures
- Architecture note explaining provider isolation

## SIG-102 — Implement the deterministic mock mailbox provider

_Labels:_ level:core, track:mail-provider, type:backend, size:m, release:required

_Depends on:_ SIG-101

### Goal

Provide a complete local mailbox that behaves consistently in development and CI.

### Acceptance criteria

- Includes announcements, normal conversations, duplicates, revisions, attachments, and malformed examples.
- Supports initial sync and incremental sync behavior.
- Reset produces the same fixtures every time.
- No real student, employee, sender, or institution data appears.
- Provider failures can be triggered for testing.

### Required evidence

- Unit tests for sync, pagination, reset, and failure modes

## SIG-103 — Build the clean announcement feed

_Labels:_ level:core, track:announcements, type:full-stack, size:l, release:required

_Depends on:_ SIG-101, SIG-102, SIG-001, SIG-002

### Goal

Display normalized announcements in a responsive, usable feed.

### Acceptance criteria

- Announcement mail appears; unrelated mock conversations do not.
- Urgent and action-required items are visually distinguishable.
- Pagination or incremental loading preserves scroll position.
- Selected announcement state works on desktop and mobile routes.
- Empty, loading, offline, and retry states use SIG-002.

### Required evidence

- Integration tests using mock provider fixtures
- Mobile and desktop recordings

## SIG-104 — Add announcement search and filters

_Labels:_ level:core, track:announcements, type:full-stack, size:m, release:required

_Depends on:_ SIG-103

### Goal

Allow students to find announcements by sender, keyword, date, category, priority, attachment, and handled state.

### Acceptance criteria

- Filters are reflected in the URL.
- Refresh and back navigation preserve filter state.
- Search is debounced and keyboard accessible.
- A clear-all action resets results predictably.
- No-result state explains which filters are active.

### Required evidence

- URL-state and filtering tests
- Narrow-screen filter interaction recording

## SIG-105 — Implement rule-based announcement classification

_Labels:_ level:core, track:announcements, type:backend, size:l, release:required

_Depends on:_ SIG-101, SIG-102

### Goal

Classify mock and connected mail without requiring an AI service.

### Acceptance criteria

- Produces announcement or not announcement with category, priority, reasons, and confidence.
- Rules consider sender patterns, subjects, headers, and configurable keywords.
- Classification is deterministic and independently testable.
- Users can override a result without changing the original email.
- Low-confidence items remain reviewable rather than disappearing.

### Required evidence

- Labeled fixture set and precision/recall summary
- Unit tests for positive, negative, and ambiguous examples

### Out of scope

- Training a machine-learning model
- Sending email content to an external AI provider

## SIG-106 — Extract deadlines and required actions

_Labels:_ level:core, track:announcements, type:backend, size:l, release:required

_Depends on:_ SIG-101, SIG-102, SIG-003

### Goal

Extract useful dates and action phrases from announcement subject/body fixtures.

### Acceptance criteria

- Recognizes explicit dates, relative dates, times, and common action phrases.
- Stores the supporting text span for user verification.
- Ambiguous dates are marked for confirmation.
- Extraction failures do not block announcement display.
- Original email content remains unchanged.

### Required evidence

- Unit tests covering Indian date formats, relative dates, missing years, and ambiguity

## SIG-107 — Add saved, handled, and snoozed announcement states

_Labels:_ level:core, track:announcements, type:full-stack, size:m, release:required

_Depends on:_ SIG-103

### Goal

Let students manage announcements without modifying their actual mailbox.

### Acceptance criteria

- Users can save, mark handled, undo, and snooze.
- App state is separate from Outlook/Gmail read state.
- Optimistic updates roll back on failure.
- Snoozed announcements reappear at the expected time.
- State changes are scoped to the signed-in user.

### Required evidence

- Repository/API tests and optimistic-failure test

## SIG-108 — Group revisions and highlight changed instructions

_Labels:_ level:advanced, track:announcements, type:full-stack, size:l, release:stretch

_Depends on:_ SIG-103, SIG-106

### Goal

Group likely revisions of the same announcement and identify changed deadlines, venues, or actions.

### Acceptance criteria

- Matching uses thread metadata and conservative normalized-subject rules.
- The newest message is never allowed to silently overwrite history.
- UI shows old and new values with source timestamps.
- Low-confidence revision matches require user confirmation.
- Unrelated messages with similar subjects remain separate.

### Required evidence

- Unit tests for valid revisions and false-positive cases
- UI screenshot showing a changed deadline and venue

## SIG-109 — Create the daily digest

_Labels:_ level:advanced, track:announcements, type:full-stack, size:m, release:stretch

_Depends on:_ SIG-105, SIG-106, SIG-107

### Goal

Generate a private daily view of new announcements, approaching deadlines, and unfinished actions.

### Acceptance criteria

- Digest generation is idempotent for a user/date.
- Includes links back to source announcements.
- Excludes handled and irrelevant items.
- User controls digest time and can disable it.
- Test mode never sends external notifications.

### Required evidence

- Digest generation tests with timezone boundaries

---

# Track C — Operational complaint challenges

## SIG-201 — Define the complaint domain model and allowed categories

_Labels:_ level:core, track:complaints, type:backend, size:m, release:required

_Depends on:_ Repository scaffold

### Goal

Create the validated complaint contract and status-transition rules.

### Acceptance criteria

- Only approved operational categories are accepted.
- Statuses are submitted, acknowledged, in_progress, resolved, and closed.
- Invalid transitions fail with stable error codes.
- Public and moderator views use separate response mappers.
- Sensitive complaint categories return a redirect-to-official-channel response rather than storing the report.

### Required evidence

- Domain and transition tests
- Public/private contract examples

## SIG-202 — Build the operational complaint submission flow

_Labels:_ level:core, track:complaints, type:full-stack, size:l, release:required

_Depends on:_ SIG-201, SIG-005

### Goal

Allow a verified user to submit a limited operational complaint.

### Acceptance criteria

- Requires category, general location, title, and description.
- Optional public anonymity hides identity from public responses but not authorized moderators.
- Form blocks prohibited sensitive categories with clear guidance.
- Prevents accidental double submission.
- Success returns a stable reference and initial status.

### Required evidence

- Validation, authorization, and double-submit tests
- Mobile form recording

## SIG-203 — Build the complaint feed and detail view

_Labels:_ level:core, track:complaints, type:full-stack, size:l, release:required

_Depends on:_ SIG-201, SIG-202, SIG-006

### Goal

Display public-safe operational complaints and their status history.

### Acceptance criteria

- Filters by category, location, and status.
- Public responses never expose reporter identity or internal notes.
- Resolved complaints remain searchable.
- Complaint detail uses the status timeline.
- Empty and error states give a useful next action.

### Required evidence

- Privacy contract tests
- Responsive screenshots

## SIG-204 — Implement moderator review and status transitions

_Labels:_ level:advanced, track:complaints, type:full-stack, size:l, release:required

_Depends on:_ SIG-201, SIG-203

### Goal

Provide an authorized moderation queue for reviewing and updating complaints.

### Acceptance criteria

- Only moderator accounts can access the queue or mutate status.
- Every transition requires a public update; closing without resolution requires a reason.
- Internal moderator notes never appear publicly.
- Every privileged action creates an audit event.
- Concurrent transitions cannot silently overwrite one another.

### Required evidence

- Authorization, concurrency, and audit tests
- Moderator workflow recording

## SIG-205 — Add safe complaint evidence uploads

_Labels:_ level:advanced, track:complaints, type:backend, type:security, size:l, release:stretch

_Depends on:_ SIG-202

### Goal

Allow limited image evidence without exposing metadata or unsafe files.

### Acceptance criteria

- Accepts only configured image types and sizes.
- Re-encodes images before storage to remove metadata.
- Uses private storage until moderator approval.
- Signed URLs expire.
- Malicious names and unsupported formats fail safely.

### Required evidence

- Upload validation and authorization tests
- Metadata-removal test fixture

## SIG-206 — Suggest duplicate complaints

_Labels:_ level:advanced, track:complaints, type:full-stack, size:l, release:stretch

_Depends on:_ SIG-203

### Goal

Reduce duplicate operational reports before a new complaint is submitted.

### Acceptance criteria

- Suggestions use category, approximate location, time, and keyword overlap.
- Matching is deterministic and explainable.
- Users see likely matches before completing a new complaint.
- Suggestions do not expose private reporter fields.
- A moderator can merge duplicates without losing status or audit history.

### Required evidence

- Matching, privacy, and merge-history tests

## SIG-207 — Let students confirm an existing complaint

_Labels:_ level:core, track:complaints, type:full-stack, size:m, release:stretch

_Depends on:_ SIG-203

### Goal

Let students add weight to an existing operational complaint instead of filing a copy.

### Acceptance criteria

- An authenticated user can confirm an open complaint from its detail view.
- One user can confirm the same complaint only once.
- Users can withdraw their own confirmation.
- Public counts update without exposing who confirmed the complaint.
- Closed or merged complaints cannot receive new confirmations.

### Required evidence

- Uniqueness, authorization, count, and privacy tests
- Screenshot or recording of confirm and withdraw states

## SIG-208 — Notify reporters about complaint updates

_Labels:_ level:core, track:complaints, type:full-stack, size:m, release:stretch

_Depends on:_ SIG-204

### Goal

Show in-app updates when a user's complaint changes status.

### Acceptance criteria

- Notifications link to the complaint.
- Repeated processing does not create duplicates.
- Users can mark notifications read.
- Public anonymity does not prevent the reporter from receiving private updates.
- External email delivery remains behind a disabled adapter.

### Required evidence

- Idempotency and privacy tests

---

# Track D — Mail provider, privacy, and sync challenges

## SIG-301 — Build Microsoft account connection with delegated OAuth

_Labels:_ level:advanced, track:mail-provider, type:full-stack, type:security, size:l, release:required

_Depends on:_ SIG-101

### Goal

Connect a test Microsoft work/school account without collecting its password.

### Acceptance criteria

- Uses authorization-code flow with PKCE and delegated least-privilege scopes.
- Validates state, nonce, issuer, audience, and redirect URI.
- Handles consent denial and tenant policy rejection clearly.
- Does not log authorization codes or tokens.
- Connection can be revoked from the application.

### Required evidence

- OAuth callback and failure-path tests
- Redacted test-account demonstration

## SIG-302 — Implement initial Microsoft Graph mailbox sync

_Labels:_ level:advanced, track:mail-provider, type:backend, size:l, release:required

_Depends on:_ SIG-301, SIG-101

### Goal

Load a bounded initial message window from the signed-in user's mailbox and normalize it.

### Acceptance criteria

- Reads only the connected user's mailbox.
- Handles pagination and rate limits.
- Maps Graph messages and attachments to provider-neutral contracts.
- Stores only fields required by the product.
- Sync can resume safely after a transient failure.

### Required evidence

- Provider contract tests using recorded, sanitized fixtures
- Rate-limit and pagination tests

## SIG-303 — Add incremental Microsoft Graph synchronization

_Labels:_ level:advanced, track:mail-provider, type:backend, size:l, release:stretch

_Depends on:_ SIG-302

### Goal

Use Microsoft Graph delta state so repeat syncs process only mailbox changes.

### Acceptance criteria

- Persists opaque delta state per user/folder.
- Handles expired or invalid delta state with a bounded resync.
- Replaying a sync is idempotent.
- Deleted provider messages do not expose stale raw content.
- Test implementation does not poll aggressively.

### Required evidence

- Delta replay, deletion, expiration, and idempotency tests

## SIG-304 — Build the Gmail provider adapter

_Labels:_ level:advanced, track:mail-provider, type:full-stack, type:security, size:l, release:stretch

_Depends on:_ SIG-101

### Goal

Implement Gmail OAuth and normalized read-only message access using test-mode accounts.

### Acceptance criteria

- Requests the narrowest usable read-only scope.
- Handles Google test-mode and consent errors clearly.
- Maps Gmail threads, messages, and attachments to the shared contracts.
- Provider-specific labels do not leak into product components.
- Disconnect revokes local access and removes stored tokens.

### Required evidence

- Sanitized fixture and provider contract tests
- Redacted test-mode demonstration

### Out of scope

- Completing Google's public restricted-scope verification
- Sending or modifying Gmail messages

## SIG-305 — Add incremental Gmail history synchronization

_Labels:_ level:advanced, track:mail-provider, type:backend, size:l, release:stretch

_Depends on:_ SIG-304

### Goal

Use Gmail history state or watch-compatible abstractions for incremental updates.

### Acceptance criteria

- Persists history state per user.
- Handles expired history with a bounded resync.
- Processing is idempotent.
- Watch renewal behavior is documented and testable without production Pub/Sub.
- Failure does not affect Microsoft or mock providers.

### Required evidence

- History replay, expiration, and provider-isolation tests

## SIG-306 — Implement encrypted token storage and complete disconnect

_Labels:_ level:advanced, track:mail-provider, type:security, size:l, release:required

_Depends on:_ SIG-301 or SIG-304

### Goal

Protect provider tokens and give users a complete disconnect/delete path.

### Acceptance criteria

- Tokens are encrypted at rest using a server-managed key.
- Token values never reach client JavaScript or logs.
- Refresh is concurrency-safe.
- Disconnect revokes provider access when supported and deletes local tokens.
- User can request removal of derived mail data.

### Required evidence

- Encryption, redaction, concurrent-refresh, and deletion tests
- Short threat-model update

## SIG-307 — Add sync retries, idempotency, and privacy-safe observability

_Labels:_ level:advanced, track:mail-provider, type:backend, type:security, size:l, release:required

_Depends on:_ SIG-102 and at least one real provider

### Goal

Make background synchronization diagnosable without logging private mail.

### Acceptance criteria

- Uses bounded retries with backoff.
- Duplicate jobs do not duplicate messages or actions.
- Logs include provider, job ID, duration, counts, and safe error codes only.
- Metrics exclude subjects, bodies, attachments, addresses, and tokens.
- Per-user sync failures do not block other users.

### Required evidence

- Retry, duplicate-job, isolation, and log-redaction tests

---

# Track E — Final quality and release challenges

## SIG-401 — Complete the GitHub Actions CI pipeline

_Labels:_ level:core, track:quality, type:devops, size:l, release:required

_Depends on:_ Repository scaffold

### Goal

Extend the starter pipeline with every check needed for the final release.

### Acceptance criteria

- Runs lockfile install, lint, type checking, and unit tests.
- Uses mock mode and no real provider secrets.
- Cancels superseded runs on the same pull request.
- Reports failures with readable step names.
- Keeps output short enough for first-time contributors to understand.

### Required evidence

- Successful run and intentionally failing example in a test branch/PR

## SIG-402 — Build critical end-to-end journeys

_Labels:_ level:final, track:quality, type:testing, size:l, release:required

_Depends on:_ SIG-103, SIG-106, SIG-202, SIG-204

### Goal

Test the product's release-critical behavior in mock mode.

### Acceptance criteria

- Covers mailbox load to announcement detail.
- Covers deadline extraction and handled state.
- Covers complaint submission to moderator resolution.
- Verifies a public response cannot reveal reporter identity.
- Runs reliably in CI at desktop and mobile viewport sizes.

### Required evidence

- Playwright tests and CI trace artifact on failure

## SIG-403 — Complete the security and privacy release review

_Labels:_ level:final, track:quality, type:security, size:l, release:required

_Depends on:_ SIG-306, SIG-307, SIG-204

### Goal

Verify that mailbox and complaint data are handled according to the documented boundaries.

### Acceptance criteria

- Threat model covers OAuth, tokens, mail content, complaints, uploads, and moderator actions.
- Public API contract tests reject private fields.
- Sensitive routes have authorization and rate-limit tests.
- Logs are scanned for prohibited content.
- Account disconnect and data deletion are tested end to end.
- Known limitations are documented without hiding risk.

### Required evidence

- Completed security checklist and automated privacy tests

## SIG-404 — Prepare the contributor showcase

_Labels:_ level:final, track:documentation, type:devops, size:l, release:required

_Depends on:_ All required release issues

### Goal

Prepare a clear local demonstration and credit individual contributors.

### Acceptance criteria

- README explains the product, privacy boundary, mock setup, and provider status.
- README.md and CONTRIBUTING.md are complete.
- The demonstration uses synthetic complaint and mailbox data.
- Release notes link merged issues and contributors.
- Demo covers announcements and complaints without exposing private data.
- Known limitations and unsupported provider states are explicit.

### Required evidence

- Tagged release and changelog
- Five-minute recorded or live local demonstration

---

# 6. Recommended issue release order

## Opening batch

Publish immediately:

- SIG-001 through SIG-008
- SIG-101
- SIG-102
- SIG-201
- SIG-401

## After contracts merge

Publish:

- SIG-103 through SIG-107
- SIG-202 and SIG-203
- SIG-301 and SIG-304

## After the main flows stabilize

Publish:

- SIG-108 and SIG-109
- SIG-204 through SIG-208
- SIG-302, SIG-303, SIG-305, SIG-306, and SIG-307

## Final week

Prioritize:

- SIG-402
- SIG-403
- SIG-404
- Remaining release-required defects

Do not release every advanced issue on day one. The staged order prevents contributors from building against contracts that are still changing.

# 7. Judging guidance

Do not rank participants by line count or number of commits. Evaluate:

| Dimension                               | Weight |
| --------------------------------------- | -----: |
| Merged product impact                   |    30% |
| Correctness and maintainability         |    20% |
| Tests and reliability                   |    15% |
| UX, accessibility, and privacy judgment |    15% |
| Code-review participation               |    10% |
| Documentation and explanation           |    10% |

A smaller contribution with strong tests and thoughtful review may score higher than a large unstable feature.

# 8. Organizer safeguards

- Use only synthetic mailbox and complaint data in the repository, CI, previews, and judging.
- Maintain at least two reviewers for OAuth, token, privacy, upload, and moderator changes.
- Respond to pull requests within 48 hours when possible.
- Freeze new features 72 hours before final judging.
- Keep mock mode functional even when real-provider work is incomplete.
- Never make Gmail public verification or university Microsoft tenant approval a requirement for participant completion.
- Reject issues or pull requests that expand into the removed Juno, ERP, placement, transport, lost-and-found, payment, or sensitive-grievance areas.
