# Feature planning reference

Templates for **full draft** / copy-paste into GitHub issues. Concise mode by default ([SKILL.md](SKILL.md)).

## GitHub copy-paste formatting

When the user asks for a **full draft**, output **one Title block plus one Body `markdown` block** per ticket.

| Agent output | GitHub field | Notes |
| ------------ | ------------ | ----- |
| `text` fence (Title) | **Title** | Paste once |
| `markdown` fence (Body) | **Body** | Full markdown; headings and `- [ ]` checkboxes are fine |
| Labels line in chat | **Labels** | User applies in the issue UI (or `gh issue create --label`) |

### Agent output pattern

    ### #??? — Validate empty cards before JSON download (Task)

    Use the **Copy** button on each block below. Paste Title into the GitHub issue title. Paste Body into the issue body. Apply the listed labels.

    ```text
    Validate empty cards before JSON download
    ```

    ```markdown
    ## Summary

    …
    ```

    **Labels:** `task`, `agent`

### Formatting rules (body blocks)

- Full issue markdown inside the fence — include `##` headings
- Use `- [ ]` for acceptance criteria and done-when lists (GitHub checkboxes)
- Use `` `backticks` `` for paths, storage keys, and issue refs (`#12`)
- Blank lines between paragraphs
- No `**Title:**` or `**Body:**` labels inside paste blocks
- Chat-only: `### #??? — … (Type)` plus the per-response copy instruction from [SKILL.md](SKILL.md)

### User workflow

1. Copy the **Title** block → GitHub issue title
2. Copy the **Body** block → issue body
3. Apply labels from the chat line (`story` / `task` / `spike` / `bug`, plus `agent` or `no-agent`)

## Labels

| Label | When |
| ----- | ---- |
| `story` | User-visible value; has acceptance criteria |
| `task` | Implementation work with clear scope |
| `spike` | Time-boxed investigation; outcome = decision or doc |
| `bug` | Broken behavior vs spec |
| `agent` | Coding agent may implement. Stay in scope. |
| `no-agent` | Advise only unless a human explicitly asks to change code |

If both `agent` and `no-agent` appear, treat as `no-agent` ([`AGENTS.md`](../../../AGENTS.md)).

Every full draft includes an **Agent accessible** section. Default to `agent` when the work is well-scoped in this repo; use `no-agent` for product-strategy, credentials, or ambiguous UX.

## Issue type guide

| Type | When to use |
| ---- | ----------- |
| **Story** | User-visible value; has acceptance criteria |
| **Task** | Internal work (refactor, CI, wiring, stub) |
| **Bug** | Broken behavior vs spec |
| **Spike** | Time-boxed investigation; outcome = decision or doc |

Parent/child work is linked in the body (`Part of: #N`, `Blocked by: #N`).

## Ticket templates

### Story

**Title** (GitHub title — user story sentence):

```text
As a [type of user], I want [goal] so that [benefit].
```

**Body:**

```markdown
## Summary

As a [type of user], I want [goal] so that [benefit].

## Background / Context

Why this story exists and what problem it solves.

**Blocked by:** #N (or none)

## UX / Design Notes

UI constraints or behavior details. Match neighboring pages and `src/components/ui/`.

## Scope

- …

### Out of Scope (optional)

- …

## Technical Notes (optional)

- **Files/modules:** `path`
- **Dependencies:** #N
- **Data considerations:** store / deck JSON / localStorage

## Acceptance Criteria

- [ ] Condition 1 is met
- [ ] Condition 2 is met
- [ ] Edge cases handled

## Agent accessible

- [x] Yes — suitable for an agent (`agent`)
- [ ] No — human only (`no-agent`)
```

### Task

**Title** (imperative, under ~80 chars):

```text
Add src/agent runtime stub
```

**Body:**

```markdown
## Summary

[One short paragraph: what to build and why.]

## Scope of Work

- [Where it lives, entry points, boundaries.]

**Part of:** #N

### Out of Scope (optional)

- …

## Technical Notes

- **Files/modules affected:** `path`
- **Approach:** [pattern to follow]

## Testing Notes

- `npm run lint` and `npm run build`
- Manual: [route or flow]

## Acceptance Criteria

- [ ] Testable outcome 1
- [ ] Testable outcome 2

## Agent accessible

- [x] Yes — suitable for an agent (`agent`)
- [ ] No — human only (`no-agent`)
```

### Bug

**Title** (short, specific symptom):

```text
Deck manager search-select does not keep the chosen collection
```

**Body:**

```markdown
## Actual behavior

Describe what is currently happening…

## Expected behavior

Describe what should happen instead…

## Steps to Reproduce

1. Go to …
2. Click …
3. Observe …

## Environment

**Browser:** …
**Route:** `/` or `/decks/:deckId`

## Acceptance Criteria

- [ ] Repro no longer occurs
- [ ] Related surfaces that read the same store still behave

## Agent accessible

- [x] Yes — suitable for an agent (`agent`)
- [ ] No — human only (`no-agent`)
```

Omit Actual/Expected sections if the title already states them clearly.

### Spike

**Title** — the question:

```text
What layout should coding agents use so they can implement agent-labeled issues safely?
```

**Body:**

```markdown
## Question

[Single question to answer]

## Background / Context

What is already known. Point at `docs/` or existing issues.

## Done when

- [ ] Written recommendation: [option A / option B / do nothing]
- [ ] Follow-up tickets listed (if any)

## Out of scope

Shipping feature code unless the issue says to.

## Agent accessible

- [x] Yes — suitable for an agent (`agent`)
- [ ] No — human only (`no-agent`)
```

## Product vs coding agent

Do not mix these in one issue:

| Kind | What it is | Where |
| ---- | ---------- | ----- |
| **Coding agent** | Implements GitHub issues in this repo | `AGENTS.md`, `.cursor/rules/` |
| **Product agent** | In-app create/study chat | `docs/agent.md`, `ChatDrawer`, planned `src/agent/` |

Product-agent **feature** work may still be labeled `agent`; that label is who may implement, not which surface.

**Propose, don’t silent-write:** the product agent proposes card drafts; the user Applies through the existing store. Study tools are read-only against the deck.

Do not create `src/agent/` until [#9](https://github.com/19TT94/refresherspace/issues/9). Folder sketch:

```
src/agent/
  provider.ts
  types.ts
  modes/
    create.ts
    study.ts
```

`ChatDrawer` stays UI. Tools and “no live writes” belong in `src/agent/`.

## Codebase area map

| Product area | Primary paths | Review focus |
| ------------ | ------------- | ------------ |
| Deck manager | `src/pages/DeckManagerPage.tsx` | Collections, create deck, search-select |
| Card builder | `src/pages/CardBuilderPage.tsx`, `src/components/CardEditor.tsx`, `src/hooks/useDeckEditor.ts` | One-card edit, Markdown, flip/preview |
| Practice | `src/pages/PracticePage.tsx` | Study surface; keep deck read-only for agent tools |
| Product agent UI | `src/components/ChatDrawer.tsx` | Chat chrome only; no tools/write policy here |
| Product agent runtime | `src/agent/` (after #9) | Provider, modes, propose-only writes |
| Store | `src/lib/store.ts`, `src/types/deck.ts` | `refresherspace-store`, collection resolution |
| Deck JSON | `src/lib/deckJson.ts`, `src/lib/markdown.ts` | Export version 1, plain-text mirrors |
| UI primitives / theme | `src/components/ui/`, `src/styles/theme.ts` | Tokens, no inline `style` |
| Component library | `src/pages/ComponentLibrary.tsx` | Showcase primitives when adding new ones |
| Docs / agent policy | `docs/`, `AGENTS.md` | Product vs coding agent, deck-write policy |

Parked ideas (not current build work): [`docs/roadmap.md`](../../../docs/roadmap.md), [`docs/future-scope.md`](../../../docs/future-scope.md).

## PR linkage

After implementation:

- PR title: short outcome (no ticket-key prefix)
- PR body: `Closes #N` plus a test plan — [pr-prepare](../pr-prepare/SKILL.md)
- Target: `main`
