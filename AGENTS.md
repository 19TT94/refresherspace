# Refresherspace — coding agents

Web app for authoring flashcard decks (React + TypeScript + Vite + styled-components). Decks live in localStorage; mobile study comes later.

```bash
npm install
npm run dev    # http://localhost:5173
npm run lint
npm run build
```

This file is the **tool-agnostic** entrypoint for coding agents (Cursor, Copilot, Claude Code, etc.) working **on** this repo. It is not the in-app create/study chat.

## Two kinds of “agent”

| Kind | What it is | Where |
| --- | --- | --- |
| **Coding agent** | Implements GitHub issues in this repo | This file + `.cursor/rules/` |
| **Product agent** | In-app create/study chat in Card Builder / Practice | [`docs/agent.md`](docs/agent.md), `ChatDrawer`, planned `src/agent/` |

Do not mix those scopes. Product-agent feature work is still allowed when the issue is labeled `agent`; the label is about *who may implement*, not which product surface.

## Layout recommendation

Use **both** an `AGENTS.md` and Cursor rules — not one or the other.

| Path | Role |
| --- | --- |
| `AGENTS.md` (this file) | Tool-agnostic: labels, product vs coding agent, `src/agent/` sketch, deck-write policy |
| `.cursor/rules/refresherspace.mdc` | Always-on Cursor conventions (imports, pages, styled-components, TODOs) |
| `.cursor/skills/` | How-tos (e.g. styled-components), not policy |

Keep rules short and Cursor-specific. Put anything a non-Cursor agent must see here.

## Issue labels

| Label | Coding agent may… |
| --- | --- |
| `agent` | Implement the issue. Stay in scope. Follow this file and `.cursor/rules/`. |
| `no-agent` | Advise only. Do not change code, configs, or docs unless a human explicitly asks in the thread. |
| `spike` | Recommend / document. No feature code unless the issue says to ship it. |

If both `agent` and `no-agent` appear, treat as `no-agent`.

## App conventions (summary)

Details and examples live in `.cursor/rules/refresherspace.mdc` and `.cursor/skills/styled-components/`. Match neighboring files.

**Imports** — blank line + comment label between groups, only the groups the file needs:

1. External packages (no comment)
2. `// Hooks`
3. `// Components`
4. `// Pages` — routing files only
5. `// Utils` — `lib/`
6. `// Types` — `types/`
7. `// Styles`

**Pages / feature components** — arrow functions; module constants above the component; styled-components **below** under `// Style Overrides`. UI primitives in `src/components/ui/` may colocate styles. Never use the inline `style` prop.

**Theme** — `theme.colors.*` semantic tokens. Transient props use a `$` prefix (`$variant`, `$size`). Hover: `filter: brightness(0.92)` or a soft surface shift. Disabled: `opacity: 0.5` + `cursor: not-allowed`.

**Stubs** — `// TODO:` at incomplete seams, naming the next concrete step.

## Product agent: `src/agent/` (planned)

Do not invent a different folder. Create/study share one runtime; they differ by tools and system prompt. Folder lands in [#9](https://github.com/19TT94/refresherspace/issues/9):

```
src/agent/
  provider.ts
  types.ts
  modes/
    create.ts
    study.ts
```

`ChatDrawer` stays UI. Tools and “no live writes” belong in `src/agent/`, not in the drawer.

## Propose, don’t silent-write decks

The user owns the deck. The product agent **proposes** card drafts; the user **Applies** through the existing store. No silent mutations of the live deck from the agent layer (create/edit). Study tools are read-only against the deck.

Product principles: [`docs/agent.md`](docs/agent.md). Deck JSON: [`docs/deck-format.md`](docs/deck-format.md).

## Follow-ups from spike #3

- After [#9](https://github.com/19TT94/refresherspace/issues/9): optional glob rule for `src/agent/**` in `.cursor/rules/`. Do not create that folder until #9.
