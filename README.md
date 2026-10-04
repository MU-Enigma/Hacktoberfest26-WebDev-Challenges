# SIGNAL — WebDev Challenges

SIGNAL is one website built by many contributors during MU Enigma's Hacktoberfest 2026 event.

The website will help students:

- find important announcements and deadlines from their email;
- report everyday campus problems and track their status.

You do **not** need to build the whole website. Pick one GitHub issue and implement only that feature.

## New contributor? Start here

1. Open the repository's **Issues** tab.
2. Choose an issue labelled `status:available`, `easy`, and `good first issue`.
3. Comment `/claim` and wait for a maintainer to assign it to you.
4. Follow [CONTRIBUTING.md](CONTRIBUTING.md).

Please do not start coding before the issue is assigned. This prevents two people from doing the same work.

## Run the project

You need [Node.js 20 or newer](https://nodejs.org/) and Git.

```bash
git clone https://github.com/MU-Enigma/Hacktoberfest26-WebDev-Challenges.git
cd Hacktoberfest26-WebDev-Challenges
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The project starts with safe mock data. You do not need an Outlook account, Gmail account, password, or API key.

## Where should I look?

| Path | What it contains |
|---|---|
| `src/app` | Website pages and styles |
| `src/components` | Reusable UI components |
| `src/data` | Fake data used during development |
| `CONTRIBUTING.md` | The complete beginner contribution guide |

Everything else is project setup. You usually will not need to change it.

## Check your work

Before opening a pull request, run:

```bash
npm run check
```

This runs linting, type checking, and tests—the same checks that run on GitHub.

## Important rules

- Work on one assigned issue at a time.
- Keep your pull request focused on that issue.
- Use only fake data from the repository.
- Never commit passwords, tokens, real email, or real complaint information.
- Mention material AI assistance in your pull request.
- Ask questions on your issue whenever you are stuck.

This is an MU Enigma community challenge. Hacktoberfest 2026 no longer counts pull requests toward official rewards, but we still use the issue and PR workflow to learn open-source collaboration.

## Maintainers

Contributors do not need to read the long challenge catalog. Organizers can find issue text and publishing instructions in [CHALLENGES.md](CHALLENGES.md).

Licensed under the [MIT License](LICENSE).
