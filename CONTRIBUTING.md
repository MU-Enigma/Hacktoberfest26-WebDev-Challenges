# Contributing to SIGNAL

Thank you for building SIGNAL with us. Contributions happen through assigned GitHub challenge issues so that two people do not unknowingly solve the same task.

## Before you start

1. Read the README, the issue from beginning to end, and this guide.
2. Comment `/claim` on an issue with `status:available`.
3. Wait for a maintainer to assign it and change the status to `status:claimed`.
4. Ask questions on the issue before widening its scope.

You may hold one core or advanced issue at a time. If there is no visible progress for 72 hours, maintainers may make it available again.

## Local setup

```bash
npm ci
cp .env.example .env
npm run dev
```

Mock mode is the default. Do not request shared provider credentials for ordinary development.

## Branches and commits

Create a branch from the latest default branch:

```bash
git switch -c challenge/SIG-001-priority-badge
```

Use focused commits with useful messages, for example `feat(announcements): add priority badge`. Do not bundle refactors or formatting unrelated to your issue.

## Definition of done

Your implementation must satisfy every acceptance criterion in the assigned issue and include its required evidence. Before opening a PR, run:

```bash
npm run check
```

Add tests at the lowest useful level. UI changes need screenshots or a short recording at desktop and mobile widths. Keyboard interactions must work without a mouse. Security- and privacy-sensitive changes need failure-path and redaction tests.

## Pull requests

- Link the issue using `Closes #123`.
- Explain what changed and what you deliberately did not change.
- Include test output and the evidence requested in the issue.
- Disclose material AI assistance and be ready to explain every submitted line.
- Never approve or merge your own PR.
- Push review fixes to the same branch; do not open a replacement PR.

## Data and privacy

Only use repository fixtures or newly created synthetic data. Never put secrets, real email, real student data, or real complaint details in code, fixtures, screenshots, logs, test output, or PR descriptions. Report suspected exposure privately using [SECURITY.md](SECURITY.md).

## Reviews and conduct

Review the change, not the person. Be specific, kind, and patient with first-time contributors. All participation follows our [Code of Conduct](CODE_OF_CONDUCT.md).
