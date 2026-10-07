---
description: Refresherspace review rules — AGENTS.md conventions, styled-components, lint and build
---

# Review guide (Refresherspace)

Applied by the global `code-review` skill (and Claude's built-in `/code-review`) to every change in this repo.

## Before reviewing

1. Read [`AGENTS.md`](../../AGENTS.md) and [`.cursor/rules/refresherspace.mdc`](../rules/refresherspace.mdc).
2. For UI diffs, also read [styled-components](../skills/styled-components/SKILL.md).
3. Compare against the PR base (usually `main`) unless the user specifies otherwise.
4. Run or remind: `npm run lint` and `npm run build` must pass.

## Checklist

- [ ] `npm run lint` and `npm run build` pass
- [ ] Import groups labeled; Style Overrides below the component (pages/feature)
- [ ] No inline `style` prop; theme tokens over magic values
- [ ] Product-agent diffs propose drafts; no silent live-deck writes
- [ ] `// TODO:` names the next concrete step (if stubbed)

## Priority areas

| Area | Paths |
|------|--------|
| Store / localStorage | `src/lib/store.ts`, `src/types/deck.ts` |
| Deck JSON import/export | `src/lib/deckJson.ts`, `src/lib/markdown.ts` |
| Card authoring | `src/pages/CardBuilderPage.tsx`, `src/components/CardEditor.tsx`, `src/hooks/useDeckEditor.ts` |
| Deck manager | `src/pages/DeckManagerPage.tsx` |
| Practice | `src/pages/PracticePage.tsx` |
| Product agent UI | `src/components/ChatDrawer.tsx` |
| Product agent runtime | `src/agent/` (do not create until [#9](https://github.com/19TT94/refresherspace/issues/9)) |
| UI primitives / theme | `src/components/ui/`, `src/styles/` |

## Review focus

- **Deck ownership** — create/edit agent work must propose; Apply goes through the existing store. Study tools stay read-only against the deck.
- **Coding vs product agent** — do not mix scopes. `ChatDrawer` stays UI; tools and write policy belong in `src/agent/` once it exists.
- **Issue labels** — `no-agent` and `spike` should not ship feature code unless the issue says to.
- **localStorage** — keep `refresherspace-store` shape compatible; bump/version carefully. Export must stay valid deck JSON ([`docs/deck-format.md`](../../docs/deck-format.md)).
- **Markdown cards** — `front` / `back` are source of truth; `frontPlain` / `backPlain` must stay derived.

## After local review

Remind: PR targets `main`. Use [pr-prepare](../pr-prepare/SKILL.md) for the copy-paste title/body.
