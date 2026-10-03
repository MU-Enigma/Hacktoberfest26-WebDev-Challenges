# Security and privacy policy

SIGNAL handles mailbox-derived data and operational complaints. Treat privacy failures as security failures.

## Report a vulnerability

Do not open a public issue for a vulnerability, leaked secret, exposed mailbox content, or identifying complaint data. Use GitHub's private vulnerability reporting for this repository. If that option is unavailable, contact the MU Enigma organizing team privately through an official committee channel.

Include a concise description, reproduction steps, impact, and any suggested mitigation. Do not include real user data in the report.

## Non-negotiable boundaries

- Never commit OAuth tokens, passwords, authorization codes, cookies, or private keys.
- Never use real email or complaint data in fixtures, CI, previews, screenshots, or demonstrations.
- Provider access is read-only and least privilege. SIGNAL does not send, delete, or modify email.
- Token values must stay server-side, encrypted at rest, and absent from logs.
- Public complaint responses must not reveal a reporter who chose anonymity.
- Logs and metrics must exclude subjects, bodies, attachments, addresses, tokens, and identifying complaint content.
- Disconnect and account deletion must revoke access where supported and remove locally stored credentials and derived private data.

Local `.env` files are ignored by Git. If a secret is committed, revoke it immediately; deleting it from a later commit is not enough.

## Scope

Security reports about the current default branch and deployed SIGNAL environments are in scope. Social engineering, denial-of-service testing, scanning university infrastructure, and accessing another person's data are out of scope.
