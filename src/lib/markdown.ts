import removeMd from 'remove-markdown'

// Types
import type { Flashcard } from '../types/deck'

/** Strip Markdown to readable plain text for portable export / other apps. */
export const toPlainText = (markdown: string): string => {
  const stripped = removeMd(markdown, {
    stripListLeaders: true,
    useImgAltText: true,
    gfm: true,
  })

  return stripped.replace(/\n{3,}/g, '\n\n').trim()
}

export const withPlainFields = (
  card: Pick<Flashcard, 'id' | 'front' | 'back'> &
    Partial<Pick<Flashcard, 'frontPlain' | 'backPlain'>>,
): Flashcard => ({
  id: card.id,
  front: card.front,
  back: card.back,
  frontPlain: toPlainText(card.front),
  backPlain: toPlainText(card.back),
})

export const applyMarkdownPatch = (
  card: Flashcard,
  patch: Partial<Pick<Flashcard, 'front' | 'back'>>,
): Flashcard =>
  withPlainFields({
    ...card,
    ...patch,
  })
