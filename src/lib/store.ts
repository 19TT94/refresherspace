import type {
  AppStore,
  Collection,
  Deck,
  DeckExport,
  Flashcard,
} from '../types/deck'
import { DEFAULT_COLLECTION_NAME, STORAGE_KEY } from '../types/deck'
import { withPlainFields } from './markdown'

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const createEmptyCard = (): Flashcard =>
  withPlainFields({
    id: createId(),
    front: '',
    back: '',
  })

const createDefaultCollection = (): Collection => ({
  id: createId(),
  name: DEFAULT_COLLECTION_NAME,
})

export const createSeedStore = (): AppStore => {
  const defaultCollection = createDefaultCollection()

  return {
    version: 1,
    collections: [defaultCollection],
    decks: [],
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeCard = (value: unknown): Flashcard | null => {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  if (typeof value.front !== 'string' || typeof value.back !== 'string') {
    return null
  }

  return withPlainFields({
    id: value.id,
    front: value.front,
    back: value.back,
  })
}

const normalizeDeck = (value: unknown): Deck | null => {
  if (!isRecord(value) || typeof value.id !== 'string') return null
  if (typeof value.title !== 'string') return null
  if (typeof value.collectionId !== 'string') return null
  if (!Array.isArray(value.cards)) return null

  const cards = value.cards
    .map(normalizeCard)
    .filter((card): card is Flashcard => card !== null)

  return {
    id: value.id,
    title: value.title,
    description: typeof value.description === 'string' ? value.description : '',
    collectionId: value.collectionId,
    cards,
    updatedAt:
      typeof value.updatedAt === 'string'
        ? value.updatedAt
        : new Date().toISOString(),
  }
}

const isAppStore = (value: unknown): value is AppStore => {
  if (!isRecord(value)) return false
  return (
    value.version === 1 &&
    Array.isArray(value.collections) &&
    Array.isArray(value.decks)
  )
}

const normalizeStore = (store: AppStore): AppStore => {
  const decks = store.decks
    .map(normalizeDeck)
    .filter((deck): deck is Deck => deck !== null)

  return {
    ...store,
    decks,
  }
}

export const loadStore = (): AppStore => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isAppStore(parsed)) {
      const seed = createSeedStore()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }

    const normalized = ensureDefaultCollection(normalizeStore(parsed))
    saveStore(normalized)
    return normalized
  } catch {
    const seed = createSeedStore()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

export const saveStore = (store: AppStore): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

const ensureDefaultCollection = (store: AppStore): AppStore => {
  const hasDefault = store.collections.some(
    (collection) =>
      collection.name.toLowerCase() === DEFAULT_COLLECTION_NAME.toLowerCase(),
  )

  if (hasDefault) return store

  const next: AppStore = {
    ...store,
    collections: [createDefaultCollection(), ...store.collections],
  }
  saveStore(next)
  return next
}

export const findCollectionByName = (
  store: AppStore,
  name: string,
): Collection | undefined => {
  const normalized = name.trim().toLowerCase()
  return store.collections.find(
    (collection) => collection.name.toLowerCase() === normalized,
  )
}

/** Empty/whitespace → Default. Existing name → reuse. Otherwise create. */
export const resolveCollection = (
  store: AppStore,
  collectionInput: string,
): { store: AppStore; collection: Collection } => {
  const trimmed = collectionInput.trim()
  const targetName = trimmed.length === 0 ? DEFAULT_COLLECTION_NAME : trimmed
  const existing = findCollectionByName(store, targetName)

  if (existing) {
    return { store, collection: existing }
  }

  const collection: Collection = {
    id: createId(),
    name: targetName,
  }

  const nextStore: AppStore = {
    ...store,
    collections: [...store.collections, collection],
  }
  saveStore(nextStore)

  return { store: nextStore, collection }
}

export const createDeck = (
  store: AppStore,
  title: string,
  collectionInput: string,
): { store: AppStore; deck: Deck } => {
  const { store: withCollection, collection } = resolveCollection(
    store,
    collectionInput,
  )

  const deck: Deck = {
    id: createId(),
    title: title.trim(),
    description: '',
    collectionId: collection.id,
    cards: [createEmptyCard()],
    updatedAt: new Date().toISOString(),
  }

  const nextStore: AppStore = {
    ...withCollection,
    decks: [deck, ...withCollection.decks],
  }
  saveStore(nextStore)

  return { store: nextStore, deck }
}

export const getDeck = (store: AppStore, deckId: string): Deck | undefined =>
  store.decks.find((deck) => deck.id === deckId)

export const getCollection = (
  store: AppStore,
  collectionId: string,
): Collection | undefined =>
  store.collections.find((collection) => collection.id === collectionId)

export const updateDeck = (
  store: AppStore,
  deckId: string,
  updater: (deck: Deck) => Deck,
): AppStore => {
  const nextStore: AppStore = {
    ...store,
    decks: store.decks.map((deck) => {
      if (deck.id !== deckId) return deck
      return {
        ...updater(deck),
        updatedAt: new Date().toISOString(),
      }
    }),
  }
  saveStore(nextStore)
  return nextStore
}

/** Import a deck export. Same id replaces; collection resolved by name. */
export const importDeck = (
  store: AppStore,
  deckExport: DeckExport,
): { store: AppStore; deck: Deck } => {
  const collectionName = deckExport.deck.collectionName?.trim() ?? ''
  const { store: withCollection, collection } = resolveCollection(
    store,
    collectionName,
  )

  const cards =
    deckExport.deck.cards.length > 0
      ? deckExport.deck.cards.map((card) => withPlainFields(card))
      : [createEmptyCard()]

  const deck: Deck = {
    id: deckExport.deck.id || createId(),
    title: deckExport.deck.title,
    description: deckExport.deck.description ?? '',
    collectionId: collection.id,
    cards,
    updatedAt: new Date().toISOString(),
  }

  const existingIndex = withCollection.decks.findIndex(
    (item) => item.id === deck.id,
  )

  const decks =
    existingIndex === -1
      ? [deck, ...withCollection.decks]
      : withCollection.decks.map((item, index) =>
          index === existingIndex ? deck : item,
        )

  const nextStore: AppStore = {
    ...withCollection,
    decks,
  }
  saveStore(nextStore)

  return { store: nextStore, deck }
}

/** Apply an export onto an existing deck id (card builder import). */
export const replaceDeckFromExport = (
  store: AppStore,
  currentDeckId: string,
  deckExport: DeckExport,
): { store: AppStore; deck: Deck } | { error: string } => {
  const existing = getDeck(store, currentDeckId)
  if (!existing) {
    return { error: 'Current deck was not found.' }
  }

  const collectionName = deckExport.deck.collectionName?.trim() ?? ''
  const { store: withCollection, collection } = resolveCollection(
    store,
    collectionName,
  )

  const cards =
    deckExport.deck.cards.length > 0
      ? deckExport.deck.cards.map((card) => withPlainFields(card))
      : [createEmptyCard()]

  const deck: Deck = {
    id: currentDeckId,
    title: deckExport.deck.title,
    description: deckExport.deck.description ?? '',
    collectionId: collection.id,
    cards,
    updatedAt: new Date().toISOString(),
  }

  const nextStore: AppStore = {
    ...withCollection,
    decks: withCollection.decks.map((item) =>
      item.id === currentDeckId ? deck : item,
    ),
  }
  saveStore(nextStore)

  return { store: nextStore, deck }
}
