---
name: feature-planning
description: >-
  Triages features and drafts concise GitHub issues for Refresherspace. Use for
  planning, stories, tasks, bugs, and spikes. Say "full drafts" for copy-paste
  issue bodies. Maps work to pages, store, and product-agent areas.
disable-model-invocation: true
---

# Feature planning and GitHub issues

Go from idea → actionable GitHub issues. **Do not** implement code unless asked.

## Output principles

- **Short by default** — only what the user needs to decide or file tickets.
- **One fact, one place** — see section boundaries below; never repeat the same detail in two sections.
- **Omit empty sections** — no `## Questions` if none; no area map unless paths matter.

## Output mode (important)

| Mode | When | What the user sees |
|------|------|-------------------|
| **Concise** (default) | Normal `@feature-planning` | Triage line + Next + optional Questions + ticket table + footer. No full descriptions. |
| **Full** | User says `full drafts`, `copy-paste`, `expand`, or `all tickets` | GitHub-ready Title + Body as **copy blocks**. See [reference.md](reference.md). |

Never paste filled examples from `reference.md` or duplicate template section headings in concise mode.

## Section boundaries (concise)

Each section has a single job. Do not spill content across sections.

| Section | Put here | Never put here |
|---------|----------|----------------|
| **Triage** | Type, size (S/M/L), surfaces (compact) | Next step, risks, tickets, paths, time box |
| **Next** | One-sentence recommended action; optional `(risk: …)` if critical | Ticket summaries, open questions, file paths |
| **Questions** | Max **2** blocking unknowns | Anything already in Next or Tickets |
| **Tickets** | Type, summary, **Deps** only (`—`, `#1`, `after #1`) | Time box, file paths, surfaces, rationale |
| **Footer** | Time box + `full draft` pointer | Triage recap, ticket detail |

## Workflow (concise)

1. **Clarify** — Ask at most **2** questions if blocked; skip if the request is clear enough to triage.
2. **Triage** — Type, size, surfaces (one line).
3. **Next** — One sentence; fold in the top risk only if it changes the recommendation.
4. **Map** — Repo paths in chat only when non-obvious ([reference.md](reference.md) area map); do not add a separate **Map** heading in concise output.
5. **Propose tickets** — Count by size (below). Summary line format per issue type.
6. **Footer** — Time box range + which ticket to expand for `full draft`.
7. **GitHub** — Create via `gh issue create` only if the user asks; else stop at the index unless **full** mode.

### Ticket count (concise mode)

| Size | Propose |
|------|---------|
| **S** | 1 ticket (summary + type). |
| **M** | 2–3 tickets: summary + type + deps only. |
| **L** | 1 **Spike** or parent Story + child summaries (no bodies). Say which child to expand first in footer. |

For unknown scope → **Spike** only, not a pile of Tasks.

### Time box estimates

| Size | Range |
|------|-------|
| **S** | 1–2 days |
| **M** | 3–5 days |
| **L** | 1–2+ weeks (spike-only until scoped → 1–3 days) |
| **Spike** (per ticket) | 1–3 days |

Adjust when serial deps clearly change the range. **Footer only** — never in ticket Notes.

### Summaries by issue type

| Type | Summary field |
|------|----------------|
| Story | `As a … I want … so that …` |
| Task / Bug | Short imperative outcome or symptom |
| Spike | Question as the title |

Templates for **full** mode: [reference.md](reference.md). Labels and `agent` / `no-agent` / `spike` policy: [`AGENTS.md`](../../../AGENTS.md). PR titles after implementation: [pr-prepare](../pr-prepare/SKILL.md).

## Concise output format (default)

```markdown
## Triage
Feature · **M** · Card Builder + store (`useDeckEditor`)

**Next:** Confirm empty-card rules, then Task + Story.

## Questions
- Block download vs warn-only?

## Tickets
| # | Type | Summary | Deps |
|---|------|---------|------|
| 1 | Task | Validate empty cards before JSON download | — |
| 2 | Story | As a deck author, I want a study-ready check so that I don't export blanks | #1 |

_Time box: ~3–5 days · `full draft` for #1 or #2._
```

Omit **Questions** when none. Footer is always the **last line**.

## Full output format

Use when user requests full drafts. Per ticket, in this order:

1. Chat heading: `### #??? — [title] (Type)`
2. One user instruction (once per response): *Use the **Copy** button on each block below. Paste Title into the GitHub issue title. Paste Body into the issue body. Apply the listed labels.*
3. **Title** — one fenced `text` block (one line only)
4. **Body** — one fenced `markdown` block using the matching template in [reference.md](reference.md)
5. **Labels** — chat line only, e.g. `**Labels:** \`story\`, \`agent\``

One ticket = one Title block + one Body block. Max **3** tickets per response unless the user asks for more.

End with the **Time box** footer (concise format). Do not repeat ticket summaries in the footer.

Do **not** put Title and Body in one fence. Do **not** add commentary inside the fences. GitHub accepts full markdown — one Body block per issue.

## Do not

- Repeat the same detail in Triage, Next, Questions, Tickets, or footer
- Add a **Risks** or **Map** heading in concise mode (fold critical risk into Next)
- Put time box, paths, or surfaces in ticket **Deps** / Notes
- Dump architecture essays or duplicate area tables from [reference.md](reference.md)
- Propose 5+ tickets in concise mode — cap at Spike + 3 follow-ups or Story + child list
- Commit, open PRs, or guess story points
- File a **Bug** without repro — use **Spike** first
- Output full issue bodies in concise mode
- Mix coding-agent repo work with product-agent create/study scope in one ticket
- Propose silent live-deck writes from the product agent
- Create `src/agent/` tickets that invent a different folder than the [#9](https://github.com/19TT94/refresherspace/issues/9) sketch

## Additional resources

- Templates + area map: [reference.md](reference.md)
- Sample triages: [examples.md](examples.md)
