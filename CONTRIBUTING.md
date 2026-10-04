# Beginner contribution guide

Welcome! An **issue** describes one task. A **branch** keeps your work separate. A **pull request (PR)** asks maintainers to review and merge your work.

## 1. Claim a task

1. Open the repository's **Issues** tab.
2. Find an issue labelled `status:available`.
3. Read its goal and checklist.
4. Comment `/claim`.
5. Wait until a maintainer assigns it to you.

For your first contribution, choose an issue labelled `easy` and `good first issue`.

## 2. Fork and download the repository

Click **Fork** on GitHub. Then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/Hacktoberfest26-WebDev-Challenges.git
cd Hacktoberfest26-WebDev-Challenges
npm install
npm run dev
```

Replace `YOUR-USERNAME` with your GitHub username. Visit [http://localhost:3000](http://localhost:3000) to confirm it works.

## 3. Create a branch

Use the challenge number from your issue:

```bash
git switch -c challenge/SIG-001-priority-badge
```

Do not work directly on `main`.

## 4. Make your change

- Implement only what the issue asks for.
- Reuse the fake data in `src/data`.
- Add or update a test when behavior changes.
- Check keyboard controls as well as mouse controls.
- Ask a question on the issue if anything is unclear.

Useful commands:

```bash
npm run dev      # start the website
npm run test     # run tests
npm run check    # run every required check
```

## 5. Save and push your work

```bash
git add .
git commit -m "feat: add announcement priority badge"
git push -u origin challenge/SIG-001-priority-badge
```

Use a short commit message that explains what changed.

## 6. Open the pull request

GitHub will show a **Compare & pull request** button after you push.

In the PR:

- write `Closes #ISSUE-NUMBER`;
- explain what you changed;
- include screenshots for visual changes;
- say how you tested it;
- mention which parts were influenced by AI tools, if any.

Push review fixes to the same branch. You do not need to open another PR.

## Before submitting

- [ ] The assigned issue requirements are complete.
- [ ] `npm run check` passes.
- [ ] No unrelated files were changed.
- [ ] No passwords, tokens, or real personal data were added.
- [ ] Visual changes were checked on desktop and mobile.

Be patient and kind during review. We care more about a clear, tested contribution than a large one.
