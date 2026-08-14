# Deck format

Export version `1` wraps a single deck. Types live in `src/types/deck.ts`. Local app state (collections + decks) is stored in `localStorage` under `refresherspace-store`.

Card sides are authored as **Markdown** (`front` / `back`). Each card also stores **plain-text** mirrors (`frontPlain` / `backPlain`) so other apps can import readable text without Markdown syntax.

## Example export

```json
{
  "version": 1,
  "deck": {
    "id": "uuid",
    "title": "Spanish verbs",
    "description": "",
    "collectionId": "uuid",
    "collectionName": "Language",
    "cards": [
      {
        "id": "uuid",
        "front": "**hablar**",
        "back": "to speak\n\n- regular `-ar` verb",
        "frontPlain": "hablar",
        "backPlain": "to speak\n\nregular -ar verb"
      }
    ],
    "updatedAt": "2026-08-12T18:00:00.000Z"
  }
}
```

## Local store shape

```json
{
  "version": 1,
  "collections": [{ "id": "uuid", "name": "Default" }],
  "decks": [
    {
      "id": "uuid",
      "title": "Spanish verbs",
      "description": "",
      "collectionId": "uuid",
      "cards": [],
      "updatedAt": "ISO-8601"
    }
  ]
}
```

## Collection resolution

When creating a deck:

- Empty target collection → use **Default** (created if missing).
- Name matches an existing collection (case-insensitive) → reuse it.
- Name is new → create that collection, then attach the deck.

## Fields

### Export `deck`

| Field            | Type   | Notes                              |
| ---------------- | ------ | ---------------------------------- |
| `id`             | string | Stable UUID for the deck           |
| `title`          | string | Display name                       |
| `description`    | string | Optional; empty string when unused |
| `collectionId`   | string | Owning collection id               |
| `collectionName` | string | Denormalized name at export time   |
| `cards`          | array  | Ordered list of flashcards         |
| `updatedAt`      | string | ISO-8601 timestamp set on export   |

### `cards[]`

| Field        | Type   | Notes                                                                |
| ------------ | ------ | -------------------------------------------------------------------- |
| `id`         | string | Stable UUID per card                                                 |
| `front`      | string | Prompt as Markdown (Refresherspace source of truth)                  |
| `back`       | string | Answer as Markdown (Refresherspace source of truth)                  |
| `frontPlain` | string | Front with Markdown stripped — use this for Anki / other plain tools |
| `backPlain`  | string | Back with Markdown stripped — use this for Anki / other plain tools  |

## Markdown + portability

- **Edit / render in app:** `front` and `back` (Markdown via `react-markdown`, fenced code highlighted with `rehype-highlight`).
- **Import elsewhere:** prefer `frontPlain` / `backPlain` so lists, bold, etc. don’t show raw `*` / `-` markers.
- Plain fields are derived whenever a card is saved or exported; they are not edited directly.
- Older local decks without plain fields are normalized on load.
- Use fenced blocks with a language tag for highlighting, e.g. ` ```ts ` … ` ``` `.
- **Import:** Card builder **Import JSON** loads a version-1 export into the *current* deck (title, cards, collection from `collectionName`). The open deck’s id is kept.

## Future: portable text vs enrichments

v1 cards are Markdown + plain text so decks can move to other tools. A later idea is optional **enrichments** (diagrams, etc.) as separate referenced JSON objects, so Refresherspace can offer richer study assets without making text export proprietary. See [agent.md](./agent.md#portable-text-vs-proprietary-rich-cards).
