import { useCallback, useEffect, useMemo, useState } from 'react'

// Utils
import { downloadDeckJson, serializeDeck } from '../lib/deckJson'
import { applyMarkdownPatch } from '../lib/markdown'
import { createEmptyCard, getDeck, loadStore, updateDeck } from '../lib/store'

// Types
import type { Deck, Flashcard } from '../types/deck'

export const useDeckEditor = (deckId: string) => {
  const [deck, setDeck] = useState<Deck | null>(() => {
    const store = loadStore()
    return getDeck(store, deckId) ?? null
  })
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )

  useEffect(() => {
    const store = loadStore()
    setDeck(getDeck(store, deckId) ?? null)
  }, [deckId])

  const persist = useCallback(
    (updater: (current: Deck) => Deck) => {
      setDeck((current) => {
        if (!current) return current
        const next = updater(current)
        updateDeck(loadStore(), deckId, () => next)
        return { ...next, updatedAt: new Date().toISOString() }
      })
    },
    [deckId],
  )

  const json = useMemo(() => (deck ? serializeDeck(deck) : ''), [deck])

  const updateCard = useCallback(
    (cardId: string, patch: Partial<Pick<Flashcard, 'front' | 'back'>>) => {
      persist((current) => ({
        ...current,
        cards: current.cards.map((card) =>
          card.id === cardId ? applyMarkdownPatch(card, patch) : card,
        ),
      }))
    },
    [persist],
  )

  const addCard = useCallback(() => {
    const card = createEmptyCard()
    persist((current) => ({
      ...current,
      cards: [...current.cards, card],
    }))
    return card.id
  }, [persist])

  const removeCard = useCallback(
    (cardId: string) => {
      persist((current) => {
        if (current.cards.length <= 1) return current
        return {
          ...current,
          cards: current.cards.filter((card) => card.id !== cardId),
        }
      })
    },
    [persist],
  )

  const moveCard = useCallback(
    (cardId: string, direction: 'up' | 'down') => {
      persist((current) => {
        const index = current.cards.findIndex((card) => card.id === cardId)
        if (index === -1) return current

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= current.cards.length) {
          return current
        }

        const cards = [...current.cards]
        const [removed] = cards.splice(index, 1)
        cards.splice(targetIndex, 0, removed)

        return { ...current, cards }
      })
    },
    [persist],
  )

  const copyJson = useCallback(async () => {
    if (!deck) return
    try {
      await navigator.clipboard.writeText(serializeDeck(deck))
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }, [deck])

  const downloadJson = useCallback(() => {
    if (!deck) return
    downloadDeckJson(deck)
  }, [deck])

  const reload = useCallback(() => {
    setDeck(getDeck(loadStore(), deckId) ?? null)
  }, [deckId])

  return {
    deck,
    json,
    copyStatus,
    updateCard,
    addCard,
    removeCard,
    moveCard,
    copyJson,
    downloadJson,
    reload,
  }
}
