# Announcement revisions (SIG-108)

The feed now groups normalized messages when an explicit In-Reply-To/References link points to a unique provider/message ID and both sender and normalized subject agree. Header names are case-insensitive; repeated Re/Fw/Fwd prefixes and leading [Updated]/[Correction] labels are normalized conservatively. Different senders or unrelated subjects never merge based on a thread link alone. Duplicate message-ID aliases are not trusted.

Same-sender, same-subject messages with different bodies within seven days produce a suggestion, not an automatic merge. The user must explicitly confirm the pair. Confirmations are view-local and reset on reload, so a tentative decision never silently persists or edits mailbox records. This conservative first implementation does not handle cross-sender updates; those remain separate.

A group shows the latest announcement in the feed while retaining all original versions in chronological order. The detail panel shows changes between adjacent versions, including previous/updated values and both source timestamps. Each original subject, body, sender and timestamp is available through an expandable history. Links selecting an older member open its group's latest version with full history visible. No source message is overwritten or mutated.

Deadlines and actions use SIG-106's extraction results, preserving source wording rather than presenting tentative dates as confirmed instants. Venue extraction supports explicit Venue:/Room:/Location: labels. Unsupported venue phrasing may not produce a diff; original history remains available for review. Removing a previously stated value displays Not stated. Action changes use extracted instruction text. Dates use the application's timestamp formatter.

The two clearly synthetic workshop messages in revision-fixtures.ts demonstrate a changed deadline (10 to 12 November) and venue (Hall A to Hall B). They are added only to the local synthetic mailbox. They require no real email or credentials. Tests cover explicit thread chains, duplicate aliases, subject-only confirmation, unrelated messages, invalid dates, complete history, removed values and escaped source markup. The screenshots in docs/images/announcement-revisions-*.jpg show the actual desktop/mobile interface.

This PR is independent of SIG-107's state controls and SIG-104's search UI. It uses the same additive detail-content extension point as those contributions; after integration the consuming page should compose both controls and revision history in that slot.
