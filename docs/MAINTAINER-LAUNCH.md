# Maintainer launch checklist

Use this after creating the public GitHub repository. The challenge publisher is dry-run by default and skips exact issue titles that already exist.

## 1. Confirm repository settings

- Add the repository to the MU Enigma organization.
- Add the Hacktoberfest topic and a concise SIGNAL description.
- Enable Issues, Discussions if desired, private vulnerability reporting, and automated secret scanning.
- Protect the default branch: require a pull request, at least one approval (two for security-sensitive changes), passing checks, resolved conversations, and no force pushes.
- Add real users or teams to `.github/CODEOWNERS` before enabling required code-owner review.
- Set repository visibility only after checking that no local chat export or `.env` file is tracked.

## 2. Validate the challenge source

```bash
npm ci
npm run challenges:validate
npm run challenges:publish -- --batch opening
```

The final command is a dry run. It should list 12 opening issues.

## 3. Publish the opening batch

Authenticate GitHub CLI with an organizer account that can create labels and issues, then run:

```bash
npm run challenges:publish -- --batch opening --repo MU-Enigma/Hacktoberfest26-WebDev-Challenges --apply
```

This creates the label catalog and only missing opening issues. Publish later batches with `contracts`, `stabilized`, and `final` after their documented dependencies land. Do not publish all advanced work on day one.

## 4. Operate the queue

- When assigning an issue, remove `status:available` and add `status:claimed`.
- Ask for visible progress within 72 hours before releasing an inactive claim.
- Move the issue to `status:review` when a linked PR opens.
- Never assign overlapping contract work without naming an integration owner.
- Respond to contributor PRs within 48 hours when possible.
- Require two reviewers for OAuth, tokens, uploads, privacy projections, moderator authorization, and log changes.

## 5. Release discipline

- Keep mock mode green throughout the event.
- Use synthetic data for CI, previews, judging, and the public demo.
- Freeze new features 72 hours before judging.
- Treat Gmail as stretch work; mock plus Outlook can complete v1.
- Credit contributors by merged impact and review quality, not line count.
