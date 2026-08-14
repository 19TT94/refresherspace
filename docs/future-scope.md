# Future scope

Ideas parked for later — not current build work. Sequencing lives in [roadmap.md](./roadmap.md).

## In-place rich editing (Write vs Markdown)

Today card faces toggle **Edit** (raw Markdown textarea) and **Preview** (read-only `react-markdown`). A later upgrade:

| Mode         | Behavior                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| **Write**    | Edit the _rendered_ card in place (bold looks bold, lists look like lists) |
| **Markdown** | Raw source textarea (keep for power users / debugging exports)             |

### Approach

- Use a rich-text engine with Markdown round-trip (e.g. **TipTap** / ProseMirror, or Milkdown).
- On change: serialize → existing `front` / `back` Markdown fields → keep deriving `frontPlain` / `backPlain` as today.
- Optional light toolbar: bold, italic, list, code — not full GFM on day one.
- Drop read-only Preview as a third mode once Write exists, or reserve Preview for a future study surface.

### Why not yet

- Non-trivial vs toggle/preview: cursor stability, list nesting, Markdown round-trip edge cases.
- Flip-card UX must not steal focus or reset the editor mid-keystroke.
- Worth doing after syntax-highlighted previews and study mode settle.

### Out of scope for that spike

- Full WYSIWYG parity with every Markdown feature.
- Homegrown `contentEditable` + custom serializers (brittle).

## User-created module library

A shareable library of study **modules** that people create and others can add to their accounts.

### Shape

- Authors publish modules (decks / collections packaged for reuse).
- Learners browse or search the library and add modules to their account to study from.
- Modules stay tied to the author’s versioning / updates over time (exact sync model TBD).

### Why not yet

- Needs accounts, sync, and a publishing surface — all still later on the roadmap.
- Discovery, trust, and update/fork semantics need product decisions before build.
