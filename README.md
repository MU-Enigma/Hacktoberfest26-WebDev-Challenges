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

## Contributor quick start

Follow these steps to get a fresh clone running locally in mock mode.

### Prerequisites

Node.js 20.9.0 or newer is required.

Check your installed versions:

```bash
node --version
npm --version
```

### Get the repo

Clone the repository and go into the project folder:

```bash
git clone https://github.com/MU-Enigma/Hacktoberfest26-WebDev-Challenges.git
cd Hacktoberfest26-WebDev-Challenges
```

### Install everything

Install project dependencies:

```bash
npm install
```

You can also run `npm ci` for a clean install directly from `package-lock.json`.

### Run mock mode

Start the development server:

```bash
npm run dev
```

Important: real OAuth credentials are NOT needed.
You do not need an Outlook account, Gmail credentials, API keys, client secrets, or external services to run or test mock mode. There is no `.env` file required. SIGNAL boots directly in local mock mode using built-in synthetic records.

### Check that it works

1. Open your browser to:
   http://localhost:3000

2. In your terminal, Next.js will report ready:
   Ready in ... ms

3. On the homepage, verify:
   - Data source shows "LOCAL"
   - Announcements indexed shows "03"
   - Open complaints shows "02"
   - Clicking Announcements or Complaints in the sidebar loads the module boards.

4. Run all checks to verify your setup passes linting, types, and unit tests:

```bash
npm run check
```

### Reset mock data

All starter data in this project is stored directly in `src/data/mock-data.ts` as static TypeScript arrays (`mockMail` and `mockComplaints`). There is no separate database or cache.

If you edited `src/data/mock-data.ts` while testing and want to get back to the clean starter data, discard your changes to that file:

```bash
git restore src/data/mock-data.ts
```

Or on older Git versions:

```bash
git checkout -- src/data/mock-data.ts
```

Run tests to confirm the default mock records are back:

```bash
npm test
```

### Troubleshooting

#### Windows

Problem:
Running `npm run dev` in PowerShell fails with:
`File ...\npm.ps1 cannot be loaded because running scripts is disabled on this system`

Fix:
Open PowerShell and run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Or use Command Prompt (CMD) or Git Bash instead.

Problem:
`Port 3000 is in use, trying 3001 instead` or server cannot bind to port 3000.

Fix:
Run on another port:
npm run dev -- -p 3001
Or find and stop the process using port 3000:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

Problem:
Git shows carriage return warnings like `LF will be replaced by CRLF`.

Fix:
Configure Git to handle line endings properly:
git config core.autocrlf true

#### macOS

Problem:
Port 3000 is occupied by macOS Control Center (AirPlay Receiver), shifting Next.js to port 3001.

Fix:
Turn off AirPlay Receiver in System Settings > General > AirDrop & AirPlay, or run on another port:
npm run dev -- -p 3001

Problem:
Node version is older than 20.9.0 or command is missing (`node: command not found`).

Fix:
Install or upgrade to Node 20 LTS using Homebrew or nvm:
brew install node
or
nvm install 20 && nvm use 20

Problem:
Permission errors during `npm install` (`EACCES: permission denied`).

Fix:
Fix npm cache ownership (do not run npm with sudo):
sudo chown -R $(whoami) ~/.npm

#### Linux

Problem:
System package manager installed an outdated Node version, or `node: command not found`.

Fix:
Install Node 20 or newer using nvm:
nvm install 20

Problem:
Node is installed with nvm, but not recognized in the current shell session.

Fix:
Activate Node in your session:
nvm use 20

Problem:
Port 3000 is already in use by another service.

Fix:
Run on another port:
npm run dev -- -p 3001
Or stop the process holding port 3000:
fuser -k 3000/tcp

Problem:
Permission denied when writing to `node_modules` (`EACCES: permission denied`).

Fix:
Ensure your user owns the project folder:
sudo chown -R $(whoami) .

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
