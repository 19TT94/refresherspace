# Feature planning examples

Default agent output is **concise** (see [SKILL.md](SKILL.md)). Full GitHub bodies live in [reference.md](reference.md).

---

## Concise — empty-card export (M)

**Input:** Authors can download decks that still have blank fronts or backs. Warn or block until cards are study-ready.

**Output:**

```markdown
## Triage
Feature · **M** · Card Builder + JSON (`useDeckEditor`, `deckJson`)

**Next:** Confirm warn vs block, then validation Task + author Story.

## Questions
- Block download, or warn and allow anyway?

## Tickets
| # | Type | Summary | Deps |
|---|------|---------|------|
| 1 | Task | Validate empty cards before JSON download | — |
| 2 | Story | As a deck author, I want a study-ready check so that I don't export blanks | #1 |

_Time box: ~3–5 days · `full draft` for #1 or #2._
```

---

## Concise — store bug (S)

**Input:** Choosing a collection in Deck Manager does not stick; new decks land in Default.

**Output:**

```markdown
## Triage
Bug · **S** · Deck Manager (`SearchSelect`, `store`)

**Next:** Repro collection resolution, fix attach-on-create, check rename path.

## Tickets
| # | Type | Summary | Deps |
|---|------|---------|------|
| 1 | Bug | Deck manager search-select does not keep the chosen collection | — |

_Time box: ~1–2 days · `full draft` for #1._
```

---

## Concise — vague input (L → Spike only)

**Input:** Make studying faster.

**Output:**

```markdown
## Triage
Unknown · **L** (unscoped) · TBD

**Next:** Spike to pick the bottleneck; no implementation tickets yet.

## Questions
- Card Builder authoring vs Practice session vs export?
- Perceived slowness on large decks or all sizes?

## Tickets
| # | Type | Summary | Deps |
|---|------|---------|------|
| 1 | Spike | Which study or authoring path feels slow, and what would change it? | — |

_Time box: 1 day · `full draft` for #1._
```

---

## Concise — product agent Apply (M)

**Input:** Agent should draft cards in Card Builder and let the user apply accepted drafts into the live deck.

**Output:**

```markdown
## Triage
Feature · **M** · Product agent (`ChatDrawer`, planned `src/agent/`)

**Next:** Keep #9 runtime stub first; then tools + Apply through `useDeckEditor` (risk: silent live-deck writes).

## Tickets
| # | Type | Summary | Deps |
|---|------|---------|------|
| 1 | Task | Add src/agent runtime stub | — |
| 2 | Task | Tool schemas and draft Apply | #1 |
| 3 | Story | As a deck author, I want to apply Agent drafts so that the live deck only changes when I accept | #2 |

_Time box: ~3–5 days · `full draft` for #1._
```

---

## Full mode

User says: `full draft for ticket #1` → agent outputs Title + Body blocks (see [reference.md](reference.md)).

Example (Task #1 — runtime stub):

    ### #??? — Add src/agent runtime stub (Task)

    Use the **Copy** button on each block below. Paste Title into the GitHub issue title. Paste Body into the issue body. Apply the listed labels.

    ```text
    Add src/agent runtime stub
    ```

    ```markdown
    ## Summary

    Add `src/agent` runtime stub: provider interface, mode registry, and types for the shared create/study shell.

    ## Scope of Work

    - New `src/agent/*` per folder sketch (provider interface, types, mode registry).
    - Create and study are modes (config/plugin), not separate packages.

    **Part of:** #6

    ### Out of Scope (optional)

    - Tool schemas, draft Apply UI, study tools, BYOK.

    ## Technical Notes

    - **Files/modules affected:** `src/agent/provider.ts`, `src/agent/types.ts`, `src/agent/modes/create.ts`, `src/agent/modes/study.ts`
    - **Approach:** One shared runtime; modes differ by tools and system prompt. Keep “no live writes” in this layer.

    ## Testing Notes

    - `npm run lint` and `npm run build`
    - Types compile; mode registry can be imported. No live model required.

    ## Acceptance Criteria

    - [ ] `src/agent` exists with provider interface, types, and create/study mode stubs
    - [ ] Modes are plugins/config, not duplicated runtimes
    - [ ] No silent live-deck writes from this layer

    ## Agent accessible

    - [x] Yes — suitable for an agent (`agent`)
    - [ ] No — human only (`no-agent`)
    ```

    **Labels:** `task`, `agent`

    _Time box: ~3–5 days · `full draft` for #2._
