# Mail boundary

Providers normalize their responses into MailMessage before returning MailPage. IDs and cursors remain opaque strings. The UI consumes derived Announcement records; it never receives provider responses, credentials, or transport metadata. Classification and extraction leave the original MailMessage unchanged. ActionItem source ranges use JavaScript UTF-16 offsets, with an exclusive end.

A sync starts with no arguments or the last completed syncToken. Follow nextCursor until the final page supplies a new syncToken. Apply messages by ID and deletedIds as removals. Persist the token only after all pages succeed. Adapters own cursor validation and errors. Provider-specific incremental APIs belong inside their adapter.

The existing feed and attachment component now share these contracts. Fixtures in src/data can be normalized by copying preview into body and adding empty headers/attachments. isMailMessage validates normalized data at runtime; adapters must construct explicit fields rather than forwarding arbitrary raw responses. URL safety remains the attachment renderer's responsibility.

## Mock mode

Create a MockMailProvider per isolated mailbox/test. sync() paginates a fixed snapshot; advance() exposes one revision and one deletion. failNext() injects a recoverable failure. reset() restores the initial snapshot. Cursors pin the snapshot even when advance() is called between pages. Callers must restart synchronization after reset. normalizeMockInput rejects malformed records and collapses repeated IDs, preserving the first valid record. All fixtures use example.edu and fixed timestamps.
