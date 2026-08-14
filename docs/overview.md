# Overview

Refresherspace is a flashcard system split by surface:

- **Web (this app):** create and edit decks, export structured JSON.
- **Mobile (planned):** study decks on the go — flip through cards, track progress.

## Why split authoring and study

Creating decks is easier on a keyboard and large screen. Studying is better as a focused mobile flow. The shared contract between them is the deck JSON format documented in [deck-format.md](./deck-format.md).

## v1 goal

Ship a reliable web authoring flow: manage decks/collections in localStorage, build cards, and export valid JSON. No accounts, sync, or spaced repetition yet — those are scoped in [roadmap.md](./roadmap.md). Longer-term ideas for an in-app study/create agent live in [agent.md](./agent.md).
