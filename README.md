# Refresherspace

Web app for authoring flashcard decks and exporting them as JSON. Mobile study comes later.

## Stack

- React 19 + TypeScript
- Vite
- styled-components
- React Router
- localStorage for decks and collections

## Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server              |
| `npm run build`   | Typecheck and build for production |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run Oxlint                         |

## Project structure

```
refresherspace/
├── AGENTS.md             # Coding-agent entrypoint (labels, layout, deck-write policy)
├── docs/                 # Product scoping and format notes
├── .cursor/
│   ├── rules/            # Cursor-injected conventions
│   └── skills/           # Local Cursor skills
└── src/
    ├── components/       # Feature components + ui primitives
    ├── hooks/            # useDeckEditor
    ├── lib/              # Store + deck JSON helpers
    ├── pages/            # DeckManager, CardBuilder, Practice, ComponentLibrary
    ├── styles/           # theme, GlobalStyle
    └── types/            # Deck / collection types
```

## Current scope

- **Deck manager (`/`)** — create a deck with a title and target collection (search-select). Blank collection uses Default; a new name creates a collection.
- **Card builder (`/decks/:deckId`)** — edit cards as Markdown with flip + preview; **Import JSON** / **View JSON** (export includes plain-text fields for other apps).
- **Component library (`/components`)** — live showcase of theme tokens and shared UI primitives.

See `docs/` for product vision and roadmap.
