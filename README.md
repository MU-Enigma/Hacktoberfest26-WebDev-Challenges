# SIGNAL

SIGNAL is a student-focused campus utility that brings two scattered workflows into one calm, private interface:

1. important announcements that are otherwise buried in email; and
2. routine operational complaints that are difficult to report and follow up.

The goal is not to replace the university mailbox or official grievance channels. SIGNAL creates a clearer working view over everyday information: what changed, what needs action, when something is due, and whether a reported facility problem has moved forward.

## What the application should do

### Announcements

Students receive large amounts of email, but only a small part of it requires action. The announcements module will connect to a mailbox using delegated, read-only OAuth access and convert relevant mail into a focused feed.

The completed module should be able to:

- identify announcement-style messages without hiding uncertain results;
- show priority, category, sender, attachments, and received time;
- extract deadlines and required actions with the supporting source text;
- search and filter announcements;
- group revisions while preserving the original history; and
- let a user save, snooze, or mark an item handled without changing the real email.

The initial repository uses deterministic synthetic mail. A contributor does not need an Outlook account, Gmail account, password, API key, or real email data to work on most features.

### Operational complaints

The complaints module is for routine campus operations such as Wi-Fi, water, electricity, washrooms, laundry, cleanliness, broken facilities, hostel maintenance, and queues.

The completed module should allow a verified student to:

- submit a complaint with a category, general location, title, and description;
- choose public anonymity while remaining privately verifiable to moderators;
- view a public-safe complaint feed and status timeline;
- confirm an existing report instead of creating a duplicate; and
- receive private updates when the complaint changes status.

This is not a channel for harassment, assault, medical, disciplinary, or named-person complaints. Those reports must be directed to the appropriate official service and must not be stored by this app.

## Current state of the project

The repository starts as a deliberately small framework rather than a finished product. It currently contains:

- a responsive application shell and sidebar;
- Overview, Announcements, and Complaints routes;
- under-construction boards showing the intended scope of each module;
- safe synthetic mailbox and complaint fixtures; and
- a lightweight lint, type-check, and test pipeline.

Features are implemented independently through focused GitHub issues. Read the full issue before coding: its acceptance criteria define the required behavior, evidence, and boundaries for that task.

## Privacy and product boundaries

These rules apply to every contribution:

- Use synthetic data only in code, tests, screenshots, and demonstrations.
- Never commit passwords, OAuth tokens, real email, personal addresses, or real complaint details.
- Mailbox access must remain delegated and read-only.
- Raw provider responses must not be passed directly into UI components.
- Public complaint responses must not reveal reporter identity or moderator-only notes.
- Do not add unrelated academic, placement, payment, transport, lost-and-found, or sensitive grievance features.

## Technology

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4 and project CSS
- Vitest
- ESLint

Node.js 20.9 or newer is required.

## Run the project locally

```bash
git clone https://github.com/MU-Enigma/Hacktoberfest26-WebDev-Challenges.git
cd Hacktoberfest26-WebDev-Challenges
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The project runs entirely with local synthetic data. No environment file or external account is required for the starter application.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/app` | Routes, layout, and global styles |
| `src/components` | Shared application UI |
| `src/data` | Synthetic development and test fixtures |
| `CONTRIBUTING.md` | Complete beginner contribution workflow |
| `CHALLENGES.md` | Organizer-maintained source for challenge issues |

## How to contribute

1. Find an issue labelled `status:available`. New contributors should begin with `easy` and `good first issue`.
2. Read the complete goal, acceptance criteria, required evidence, dependencies, and out-of-scope section.
3. Comment `/claim` and wait for a maintainer to assign the issue.
4. Fork the repository and create a branch such as `challenge/SIG-001-priority-badge`.
5. Implement only the assigned scope and add the requested tests or visual evidence.
6. Run `npm run check`, then open a pull request that links the issue with `Closes #ISSUE-NUMBER`.

Do not begin an unassigned issue. Keeping one contributor on each task prevents duplicated work and makes reviews manageable. See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete step-by-step guide.

## Validate your work

```bash
npm run check
```

This runs linting, TypeScript validation, and unit tests. The same command runs in GitHub Actions for every push and pull request.

For visual work, also verify the affected page at desktop and mobile widths and include screenshots in the pull request.

## License

Licensed under the [MIT License](LICENSE).
