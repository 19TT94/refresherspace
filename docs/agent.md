# Study & create agent

Exploratory notes for an in-app agent that helps **create cards** and **study decks**. Not a build plan yet — a place to sharpen the idea before we wire models, tools, or UI.

## Why an agent fits Refresherspace

Authoring and study are already split surfaces. An agent can sit in both without replacing either:

- **Create:** turn messy notes, a topic, or a pasted source into draft cards that the user reviews in Card Builder.
- **Study:** coach through a session — quiz, explain wrong answers, suggest related cards, or generate follow-ups when a gap shows up.

The portable deck JSON ([deck-format.md](./deck-format.md)) stays the shared interchange contract. Agents should propose changes against that core shape (or against optional rich attachments — see below), not invent a one-off card schema the rest of the app cannot read.

## Jobs to explore

### Create

| Job | Rough UX | Notes |
| --- | --- | --- |
| Topic → deck | “Make a starter deck on X” | User picks collection; agent proposes title + cards |
| Notes → cards | Paste markdown / lecture notes | Chunk + extract front/back; user accepts/edits |
| Expand deck | “Add 10 more on this theme” | Grounded on existing cards to avoid duplicates |
| Improve wording | “Tighten fronts; make backs one idea” | Edit proposals, not silent rewrites |
| Enrich card | “Add a diagram for this back” | Writes proprietary rich assets; text card stays exportable |

### Study

| Job | Rough UX | Notes |
| --- | --- | --- |
| Quiz mode | Agent asks from the deck; user answers in chat or voice | Prefer deck cards over free hallucination |
| Socratic help | After a miss, ask guiding questions before revealing | Keep the “back” as ground truth |
| Gap fill | “I keep missing these — make practice variants” | Writes *new* cards into a draft for review |
| Session summary | What was weak, what to restudy | Could feed SRS later |

## Portable text vs proprietary rich cards

Support **two layers** so users can leave with their content *and* get value that only Refresherspace renders well.

### Layer A — portable text (interchange)

- What we export today: `front` / `back` (and later simple optional fields) in versioned JSON.
- Enough for other apps, Anki-style imports, backups, and “I own my cards.”
- Agent create/study should always be able to operate on this layer alone.

### Layer B — proprietary enrichments (referenced objects)

- Agent (or the app) can generate graphics, layouts, audio, or structured study aids.
- Those assets live as **separate JSON objects** (plus blobs/files) keyed by id, referenced from the card — not inlined as the only representation of the card.
- Example sketch:

```json
{
  "id": "card-uuid",
  "front": "mitochondria",
  "back": "organelle that produces ATP",
  "enrichmentIds": ["enrich-uuid"]
}
```

```json
{
  "id": "enrich-uuid",
  "cardId": "card-uuid",
  "kind": "diagram",
  "generator": "agent",
  "payload": { "imageRef": "…", "alt": "…", "prompt": "…" }
}
```

### Why split them

| Goal | How the split helps |
| --- | --- |
| Move cards elsewhere | Export Layer A only; other tools ignore enrichments |
| Keep Refresherspace special | Study UI can show diagrams, agent layouts, etc. from Layer B |
| Avoid lock-in of meaning | Text remains source of truth; media is additive |
| Cost control | Generate enrichments on demand; don’t block basic decks on media gen |

### Open questions for this model

- Export modes: “portable only” vs “full Refresherspace package” (zip/JSON with enrichments).
- What happens in foreign apps when `enrichmentIds` are present — strip on export by default?
- Can Layer B exist without Layer A text? Prefer **no** — always keep a text fallback.
- Storage: enrichments in the same localStorage blob vs object store / filesystem once media appears.

## Bring your own agent (BYOK)

**Idea:** Refresherspace orchestrates tools and UI; **inference runs on an LLM account the user already pays for**. Users should not *have* to buy agent tokens from the platform to create or study with AI.

### Why

- Matches local-first decks: we don’t need to sell seats just to cover model margin.
- Clearer cost story: “your key, your bill.”
- Privacy narrative: card text goes to *their* provider under *their* agreement (still disclose what leaves the device).
- Optional later: a platform-hosted tier for people who don’t want to manage keys.

### Shapes to explore

1. **BYO API key** — OpenAI / Anthropic / etc. key stored by the user; app calls the provider (directly or via proxy).
2. **BYO endpoint** — OpenAI-compatible base URL (OpenRouter, Azure, Ollama, corporate gateway).
3. **Hybrid** — agent-free / rules-based study always works; cloud agent unlocks when a key or endpoint is configured.

### Tradeoffs

| Approach | Upside | Downside |
| --- | --- | --- |
| Key in the browser | Simple; no backend | Key leakage, CORS, harder abuse controls |
| Thin backend proxy | Key stays server-side; consistent tool calling | We operate infra; still “their” billing if we pass through |
| Platform-hosted only | Easiest UX | We eat cost or must charge for usage |

### Product stance (draft)

- **Default path:** bring your own agent / key.
- **Platform usage:** optional convenience, not required for core agent features.
- Document provider differences (tool calling quality, rate limits) so “works in ChatGPT but not here” is an expected support theme.

## Product principles (draft)

1. **User owns the deck.** Agent proposes; user accepts. No silent card mutations in the live deck without an explicit apply step (at least for create/edit).
2. **Ground in the deck.** Study answers and explanations should cite or stick to card backs unless the user asks to go beyond.
3. **Portable core, optional richness.** Every card has exportable text; proprietary enrichments are referenced add-ons, never the only copy of the idea.
4. **Opt-in surface.** Agent is a panel or mode, not the default path for every click — keep Deck Manager / Card Builder usable offline and agent-free.
5. **Cost and privacy aware.** Prefer BYOK so agent usage bills the user’s existing LLM account; always disclose when card text or media prompts leave the device.
6. **Enrichments are optional.** Basic text decks stay first-class; graphics and other agent media never block create/export/study of Layer A.

## Where it could live in the UI

```text
Settings / account     →  connect BYO key or OpenAI-compatible endpoint
Deck Manager           →  optional “Generate deck…” entry point
Card Builder           →  side panel: draft cards / expand / rewrite / enrich
Study (mobile or web)  →  coach chat + quiz; render enrichments when present
Export                 →  “Portable JSON” vs “Full package”
```

Early spike candidate: **Card Builder panel only** (create/expand on text cards) + **BYOK settings stub**. Study coaching and media enrichments wait until those spikes feel solid.

## Architecture sketches

### Minimal (tools + chat)

- Chat UI with tools: `list_cards`, `propose_cards`, `update_draft` (later `propose_enrichment`).
- Draft buffer in the client; “Apply to deck” writes through the existing store.
- Model sees deck title, collection, and card list (or a retrieved subset for large decks).
- Provider client configured from user key / base URL.

### Retrieval for large decks

- Embed cards; retrieve top-k for the current question or generation prompt.
- Reduces tokens and keeps study answers closer to the right cards.

### Offline / on-device (later)

- Small local model for quiz phrasing only; cloud for generation.
- Or agent-free study with rule-based SRS; BYOK agent as the cloud assist.

## Risks and open questions

- **Hallucinated facts** on study explain — how hard do we lock to card backs?
- **Duplicate and low-quality cards** from generate — need accept UI, dedupe, and maybe quality heuristics.
- **Evaluation** — golden decks and “accept rate” of proposed cards; study helpfulness is harder to measure.
- **Identity of “agent”** — Cursor-style coding agent vs. product chat with tools; start with product chat + explicit tools.
- **Mobile** — full chat on phone vs. lightweight “explain this card” / “quiz me” actions.
- **BYOK vs hosted** — client-side keys first, or always proxy? When (if ever) offer platform-metered usage?
- **Enrichment portability** — default export strips Layer B; how do we brand “full package” without feeling lock-in?
- **Media cost** — image generation is expensive even on BYOK; gate enrich flows separately from text propose.

## Suggested exploration order

1. Write 2–3 concrete user stories (create from notes; expand deck; quiz on misses).
2. Spike Card Builder “propose cards” → draft list → Apply (text only, no study yet).
3. Spike BYOK settings (one provider or OpenAI-compatible endpoint) wired to that propose flow.
4. Define tool schemas against [deck-format.md](./deck-format.md), plus a draft enrichment object schema.
5. Only then design study coaching and agent-generated graphics on top of a flip/quiz session.

## Related

- Product split: [overview.md](./overview.md)
- Format constraints: [deck-format.md](./deck-format.md)
- Sequencing: [roadmap.md](./roadmap.md)
