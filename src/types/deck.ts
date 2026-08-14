export interface Flashcard {
  id: string
  front: string
  back: string
  frontPlain: string
  backPlain: string
}

export interface Collection {
  id: string
  name: string
}

export interface Deck {
  id: string
  title: string
  description: string
  collectionId: string
  cards: Flashcard[]
  updatedAt: string
}

export interface DeckExport {
  version: 1
  deck: Deck & {
    collectionName: string
  }
}

export interface AppStore {
  version: 1
  collections: Collection[]
  decks: Deck[]
}

export const DEFAULT_COLLECTION_NAME = 'Default'
export const STORAGE_KEY = 'refresherspace-store'
