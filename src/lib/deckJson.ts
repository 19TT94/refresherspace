import type { AppStore, Deck, DeckExport, Flashcard } from '../types/deck'
import { withPlainFields } from './markdown'
import {
  createEmptyCard,
  createId,
  getCollection,
  loadStore,
  replaceDeckFromExport,
} from './store'

export { createEmptyCard, createId } from './store'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseImportedCard = (value: unknown): Flashcard | null => {
  if (!isRecord(value)) return null
  if (typeof value.front !== 'string' || typeof value.back !== 'string') {
    return null
  }

  return withPlainFields({
    id: typeof value.id === 'string' && value.id ? value.id : createId(),
    front: value.front,
    back: value.back,
  })
}

export type ParseDeckExportResult =
  { ok: true; data: DeckExport } | { ok: false; error: string }

/** Parse a Refresherspace deck export JSON string. */
export const parseDeckExport = (raw: string): ParseDeckExportResult => {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'File is not valid JSON.' }
  }

  if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.deck)) {
    return {
      ok: false,
      error: 'Expected a version 1 deck export ({ version, deck }).',
    }
  }

  const source = parsed.deck
  if (typeof source.title !== 'string') {
    return { ok: false, error: 'Deck is missing a title.' }
  }
  if (!Array.isArray(source.cards)) {
    return { ok: false, error: 'Deck is missing a cards array.' }
  }

  const cards = source.cards
    .map(parseImportedCard)
    .filter((card): card is Flashcard => card !== null)

  const deck: DeckExport['deck'] = {
    id: typeof source.id === 'string' && source.id ? source.id : createId(),
    title: source.title,
    description:
      typeof source.description === 'string' ? source.description : '',
    collectionId:
      typeof source.collectionId === 'string' ? source.collectionId : '',
    collectionName:
      typeof source.collectionName === 'string' ? source.collectionName : '',
    cards: cards.length > 0 ? cards : [createEmptyCard()],
    updatedAt:
      typeof source.updatedAt === 'string'
        ? source.updatedAt
        : new Date().toISOString(),
  }

  return {
    ok: true,
    data: {
      version: 1,
      deck,
    },
  }
}

export const toDeckExport = (deck: Deck): DeckExport => {
  const store = loadStore()
  const collection = getCollection(store, deck.collectionId)

  return {
    version: 1,
    deck: {
      ...deck,
      cards: deck.cards.map((card) => withPlainFields(card)),
      collectionName: collection?.name ?? 'Default',
      updatedAt: new Date().toISOString(),
    },
  }
}

export const serializeDeck = (deck: Deck): string =>
  JSON.stringify(toDeckExport(deck), null, 2)

export const downloadDeckJson = (deck: Deck): void => {
  const json = serializeDeck(deck)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const slug =
    deck.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'deck'
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slug}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const importDeckFromJson = (
  raw: string,
  currentDeckId: string,
): { ok: true; deck: Deck; store: AppStore } | { ok: false; error: string } => {
  const parsed = parseDeckExport(raw)
  if (!parsed.ok) return parsed

  const result = replaceDeckFromExport(loadStore(), currentDeckId, parsed.data)
  if ('error' in result) {
    return { ok: false, error: result.error }
  }

  return { ok: true, deck: result.deck, store: result.store }
}
