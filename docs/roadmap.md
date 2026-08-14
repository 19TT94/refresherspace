# Roadmap

Scoped plans for Refresherspace. Not commitments — use this to park ideas while the deck builder stabilizes.

## Near term

- Edit deck title / move deck between collections from the manager.
- Delete decks and empty collections.
- Validate empty cards before download; optional “study-ready” check.

## Sync and accounts

- Auth (email magic link or OAuth).
- Cloud store for decks so web edits show up on mobile.
- Conflict policy (last-write-wins vs. per-card merge).

## Mobile study app

- React Native (Expo) client that imports or syncs the same JSON.
- Flip-through study mode first.
- Later: spaced repetition, session stats, offline cache.

## Later product ideas

- Shared / public decks.
- Images and audio on cards.
- Tags and search across decks.
- Import from common formats (CSV, Anki export).
- In-app agent for creating cards and coaching study sessions (including BYOK and portable vs proprietary enrichments) — see [agent.md](./agent.md).
- In-place rich “Write” mode (TipTap-style) alongside raw Markdown — see [future-scope.md](./future-scope.md).
