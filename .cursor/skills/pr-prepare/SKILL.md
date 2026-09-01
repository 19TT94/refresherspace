---
name: pr-prepare
description: >-
  Prepares a Refresherspace branch for pull request: lint, build, review
  checklist, and a copy-paste PR title/body. Use when the user is about to open
  a PR, asks to prepare for merge, wants a PR message, or wants a pre-PR checklist.
disable-model-invocation: true
---

# Prepare pull request

## Required output: PR text in a copy box

When drafting a PR title or body, the deliverable is a **single fenced code
block** the user can copy into GitHub.

- Put the full title and body inside one copy box (fenced code block).
- Do **not** render the PR body as chat markdown (headings, lists, checkboxes
  outside the fence). That is not copy-pasteable as one block.
- Chat around the box may include checklist notes (lint, review). The PR
  text itself must only appear inside the fence.

## Checklist (run in order)

1. **Lint + typecheck/build**
   ```bash
   npm run lint
   npm run build
   ```
   Optionally: `npm run format:check`.

2. **Agent Review** (Cursor)
   - Source Control → Agent Review vs `main` (or PR base)
   - Or `/agent-review` in Agent chat
   - Use **Deep** for store/JSON, product-agent, or `src/agent/` changes

3. **Local review**
   - Use [code-review](../code-review/SKILL.md) if the user wants findings first

4. **Open PR**
   - Target: `main`
   - Title: short outcome, no ticket-key prefix (match existing PRs)
   - Body: Summary bullets, `Closes #N` when an issue exists, Test plan checkboxes

5. **On GitHub**
   - Confirm the linked issue and labels still make sense

## PR description (inside the copy box)

```text
Short outcome title

## Summary
- What changed and why
- Root cause bullets for bugfixes

Closes #N

## Test plan
- [ ] npm run lint
- [ ] npm run build
- [ ] Manual: [route or flow to click through]
```

Link GitHub issues with `Closes #N` (or `Refs #N` if this PR is a slice).

## Do not

- Commit secrets, API keys, or `.env` files
- Silent-write the live deck from product-agent code
- Create `src/agent/` unless implementing [#9](https://github.com/19TT94/refresherspace/issues/9)
- Open a PR for a `no-agent` or `spike` issue unless the user explicitly asked to ship it
