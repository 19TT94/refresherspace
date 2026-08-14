import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

// Components
import { Button, Card, Markdown } from '../components/ui'

// Utils
import { getCollection, getDeck, loadStore } from '../lib/store'

// Types
import type { Flashcard } from '../types/deck'

const shuffleCards = (cards: Flashcard[]) => {
  const next = [...cards]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const PracticePage = () => {
  const { deckId = '' } = useParams()
  const navigate = useNavigate()
  const store = useMemo(() => loadStore(), [deckId])
  const deck = getDeck(store, deckId)

  const [order, setOrder] = useState<Flashcard[]>(() =>
    deck ? shuffleCards(deck.cards) : [],
  )
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!deck) return
    setOrder(shuffleCards(deck.cards))
    setIndex(0)
    setFlipped(false)
    setFinished(false)
  }, [deck])

  const card = order[index]
  const total = order.length
  const collection = deck
    ? getCollection(store, deck.collectionId)
    : undefined

  const restart = useCallback(() => {
    if (!deck) return
    setOrder(shuffleCards(deck.cards))
    setIndex(0)
    setFlipped(false)
    setFinished(false)
  }, [deck])

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      setFinished(true)
      setFlipped(false)
      return
    }
    setIndex((current) => current + 1)
    setFlipped(false)
  }, [index, total])

  const goPrevious = useCallback(() => {
    if (finished) {
      setFinished(false)
      setIndex(total - 1)
      setFlipped(false)
      return
    }
    if (index <= 0) return
    setIndex((current) => current - 1)
    setFlipped(false)
  }, [finished, index, total])

  const toggleFlip = useCallback(() => {
    if (finished || !card) return
    setFlipped((value) => !value)
  }, [card, finished])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        toggleFlip()
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'j') {
        event.preventDefault()
        if (!finished) goNext()
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'k') {
        event.preventDefault()
        goPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [finished, goNext, goPrevious, toggleFlip])

  if (!deck) {
    return <Navigate to="/" replace />
  }

  if (total === 0) {
    return (
      <Page>
        <Header>
          <BackLink to={`/decks/${deck.id}`}>← Edit deck</BackLink>
          <Brand>{deck.title || 'Untitled deck'}</Brand>
        </Header>
        <EmptyState>
          <p>This deck has no cards to practice yet.</p>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(`/decks/${deck.id}`)}
          >
            Add cards
          </Button>
        </EmptyState>
      </Page>
    )
  }

  return (
    <Page>
      <Header>
        <NavRow>
          <BackLink to={`/decks/${deck.id}`}>← Edit deck</BackLink>
          <BackLink to="/">Decks</BackLink>
        </NavRow>
        <TitleRow>
          <div>
            <Brand>{deck.title || 'Untitled deck'}</Brand>
            <Subtitle>
              Practice · {collection?.name ?? 'Default'} · {total} cards
            </Subtitle>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={restart}>
            Shuffle & restart
          </Button>
        </TitleRow>
      </Header>

      <Session>
        {finished ? (
          <FinishedPanel>
            <FinishedTitle>Session complete</FinishedTitle>
            <FinishedCopy>
              You reviewed all {total} cards in this deck.
            </FinishedCopy>
            <FinishedActions>
              <Button type="button" variant="primary" onClick={restart}>
                Practice again
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/decks/${deck.id}`)}
              >
                Edit deck
              </Button>
            </FinishedActions>
          </FinishedPanel>
        ) : (
          <>
            <SessionBar>
              <Progress aria-live="polite">
                Card {index + 1} of {total}
              </Progress>
              <Hint>Space / Enter flips · ← → moves between cards</Hint>
            </SessionBar>

            <Scene>
              <FlipButton
                type="button"
                onClick={toggleFlip}
                aria-pressed={flipped}
                aria-label={
                  flipped
                    ? 'Showing back. Click to show front'
                    : 'Showing front. Click to show back'
                }
              >
                <Flipper $flipped={flipped}>
                  <Face $side="front" aria-hidden={flipped}>
                    <FaceTitle>Front</FaceTitle>
                    <FaceBody>
                      <Markdown emptyLabel="Front is empty">
                        {card.front}
                      </Markdown>
                    </FaceBody>
                  </Face>
                  <Face $side="back" aria-hidden={!flipped}>
                    <FaceTitle>Back</FaceTitle>
                    <FaceBody>
                      <Markdown emptyLabel="Back is empty">
                        {card.back}
                      </Markdown>
                    </FaceBody>
                  </Face>
                </Flipper>
              </FlipButton>
            </Scene>

            <Controls>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goPrevious}
                disabled={index === 0}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={toggleFlip}
                aria-pressed={flipped}
              >
                Flip
              </Button>
              <Button type="button" variant="primary" onClick={goNext}>
                {index >= total - 1 ? 'Finish' : 'Next'}
              </Button>
            </Controls>
          </>
        )}
      </Session>
    </Page>
  )
}

export default PracticePage

// Style Overrides
const Page = styled.div`
  min-height: 100dvh;
  max-width: 48rem;
  margin: 0 auto;
  padding: ${({ theme }) =>
    `${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[6]}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const Header = styled.header`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`

const NavRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`

const BackLink = styled(Link)`
  width: fit-content;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
  flex-wrap: wrap;
`

const Brand = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

const Session = styled(Card)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const SessionBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const Progress = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.muted};
`

const Scene = styled.div`
  flex: 1;
  min-height: 18rem;
  perspective: 1200px;
  display: flex;
  flex-direction: column;
`

const FlipButton = styled.button`
  flex: 1;
  min-height: 0;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;

  &:focus-visible {
    border-radius: ${({ theme }) => theme.radii.xl};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`

const Flipper = styled.div<{ $flipped: boolean }>`
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 16rem;
  transform-style: preserve-3d;
  transition: transform 0.55s ease;
  transform: ${({ $flipped }) =>
    $flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Face = styled.div<{ $side: 'front' | 'back' }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[5]};
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(
    160deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.primarySoft} 140%
  );
  box-shadow: ${({ theme }) => theme.shadows.card};
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: ${({ $side }) =>
    $side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)'};
  overflow: hidden;
`

const FaceTitle = styled.span`
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`

const FaceBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Controls = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const Hint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const FinishedPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]};
`

const FinishedTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const FinishedCopy = styled.p`
  margin: 0;
  max-width: 24rem;
  color: ${({ theme }) => theme.colors.muted};
`

const FinishedActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
  justify-content: center;
`

const EmptyState = styled(Card)`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`
