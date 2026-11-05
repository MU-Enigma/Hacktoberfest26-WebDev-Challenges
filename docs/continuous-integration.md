# Pull request checks (SIG-401)

The Check pull request workflow runs on pull requests and pushes to main. It installs the package-lock.json dependencies with Node.js 22, then runs ESLint, TypeScript validation, and the unit suite in separate named steps. These are the same checks as npm run check locally. The job label deliberately says unit tests, not build: the project does not currently define a build script.

## Mock mode and permissions

Tests use the repository's synthetic mailbox and complaint fixtures. The job receives no real provider credentials, API keys or secrets, and never configures a mailbox connection. CI=true makes the execution noninteractive and TZ=UTC catches accidental dependence on the runner's timezone; application logic uses its configured timezone explicitly. npm install may contact the package registry; mock mode does not mean the dependency installation is offline.

The workflow requests only contents:read and does not persist checkout credentials. It uses pull_request, not pull_request_target, so code checks execute without privileged write access. Fork PRs may require a maintainer to approve their first workflow run. No secrets are needed to approve or run these checks.

## Reading and reproducing a failure

Open a PR's Checks tab, then the named failed step. Installation failures indicate dependency/network problems; Lint reports the source location; Check TypeScript types reports incompatible types; Run unit tests with synthetic fixtures reports failed assertions. Later steps stop after an earlier failure. Use npm ci followed by npm run check to reproduce the suite locally.

Each PR number has its own concurrency group. A newer push cancels an older run for the same PR without canceling checks for other PRs. Main-branch pushes use their ref as the group. The job times out after ten minutes instead of hanging indefinitely.

## Failure evidence

The CI contribution PR links a controlled test PR in the contributor's fork. A temporary synthetic assertion intentionally fails the test step, demonstrating that a failed test prevents a green check. A later commit removes that temporary test and restores a successful run. The deliberate failure is confined to the evidence branch; it is not part of the contribution branch or upstream PR. Both run links are recorded in the contribution PR for review.
