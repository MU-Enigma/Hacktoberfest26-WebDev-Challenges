# SIGNAL — Hacktoberfest 2026 WebDev Challenges

SIGNAL is one shared, student-focused product built through focused GitHub issues and pull requests. It makes important campus announcements easier to act on and everyday operational complaints easier to track.

This is **not a level-by-level submission repository**. You do not add work in a folder named after yourself. Contributors claim a feature issue, improve the shared application, and open a focused PR.

## What we are building

### Announcements

SIGNAL turns announcement-style email into a clean, searchable feed. It will identify deadlines and required actions, group revisions, and let students save, snooze, or mark items handled. Microsoft Outlook is the first real provider; Gmail is an optional advanced adapter.

### Operational complaints

Students can report and track routine campus problems—Wi-Fi, water, electricity, washrooms, laundry, cleanliness, broken facilities, hostel maintenance, and queues. Moderators can review progress without exposing a reporter who chose public anonymity.

## Starting point

The repository intentionally starts small:

- a Next.js and TypeScript application shell;
- responsive placeholder routes for both product modules;
- deterministic, synthetic mail and complaint fixtures;
- mock mailbox mode as the credential-free default;
- shared visual tokens and basic quality checks;
- 36 scoped challenge specifications ready to publish as GitHub issues.

The placeholders are not missing polish—they preserve meaningful work for contributors. Implement features only through an assigned issue.

## Final goal

SIGNAL v1 is complete when the announcement workflow, complaint workflow, Outlook connection, privacy protections, automated tests, CI, accessibility, documentation, and a synthetic-data public demo all work end to end. Mock mode plus Outlook is a successful release; Gmail must not block it.

## Quick start

Prerequisites: Node.js 22 and npm 11.

```bash
git clone https://github.com/MU-Enigma/Hacktoberfest26-WebDev-Challenges.git
cd Hacktoberfest26-WebDev-Challenges
cp .env.example .env
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No email account, OAuth app, or real student data is required. Keep `.env` local; it is ignored by Git.

Useful commands:

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the local app          |
| `npm run test`      | Run unit tests once          |
| `npm run lint`      | Run ESLint                   |
| `npm run typecheck` | Check TypeScript             |
| `npm run format`    | Check formatting             |
| `npm run build`     | Create the production build  |
| `npm run check`     | Run every local verification |

## Contributing

1. Browse the [open issues](https://github.com/MU-Enigma/Hacktoberfest26-WebDev-Challenges/issues) and choose one marked `status:available`.
2. Comment `/claim` and wait for assignment.
3. Create `challenge/SIG-###-short-name` from the latest default branch.
4. Implement only the claimed scope and add the evidence requested by the issue.
5. Run `npm run check` and open a PR linked to the issue.
6. Disclose material AI assistance and respond to review on the same branch.

Claim only one core or advanced issue at a time. Show progress within 72 hours or let a maintainer release the issue. Read [CONTRIBUTING.md](CONTRIBUTING.md) before starting.

All Hacktoberfest submissions must be opened as pull requests by **31 October 2026**.

## Privacy boundary

Use synthetic data only. Never commit mailbox tokens, passwords, raw personal email, real complaint details, or identifying student information. SIGNAL never sends, deletes, or modifies email, and it does not cover ERP/Juno, attendance, grades, placement, transport, payments, lost and found, or sensitive personal grievances. See [SECURITY.md](SECURITY.md).

## For maintainers

The complete issue wording, labels, dependencies, staged release order, judging rubric, and safeguards live in [docs/CHALLENGES.md](docs/CHALLENGES.md). Follow [docs/MAINTAINER-LAUNCH.md](docs/MAINTAINER-LAUNCH.md) to publish the opening batch safely.

## License

Code in this repository is available under the [MIT License](LICENSE).
