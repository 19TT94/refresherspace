import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

// Hooks
import { useDeckEditor } from '../hooks/useDeckEditor'

// Components
import CardEditor from '../components/CardEditor'
import ChatDrawer from '../components/ChatDrawer'
import JsonPreview from '../components/JsonPreview'
import { Button, Card, Modal, SearchSelect } from '../components/ui'

// Utils
import { importDeckFromJson } from '../lib/deckJson'
import { getCollection, loadStore } from '../lib/store'

// Types
import type { Flashcard } from '../types/deck'

const cardOptionLabel = (card: Flashcard, index: number) => {
  const preview = (card.frontPlain || card.front).replace(/\s+/g, ' ').trim()
  if (!preview) return `Card ${index + 1} — Empty`
  const clipped = preview.slice(0, 72)
  return `Card ${index + 1} — ${clipped}${preview.length > 72 ? '…' : ''}`
}

const CardBuilderPage = () => {
  const { deckId = '' } = useParams()
  const navigate = useNavigate()

  const {
    deck,
    json,
    copyStatus,
    updateCard,
    addCard,
    removeCard,
    copyJson,
    downloadJson,
    reload,
  } = useDeckEditor(deckId)
  
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState('')
  const [cardQuery, setCardQuery] = useState('')
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('preview')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set the active card to the first card in the deck if no active card is set
  useEffect(() => {
    if (!deck) return
    setActiveCardId((current) =>
      deck.cards.some((card) => card.id === current)
        ? current
        : (deck.cards[0]?.id ?? ''),
    )
  }, [deck])

  const activeIndex = useMemo(() => {
    if (!deck) return -1
    return deck.cards.findIndex((card) => card.id === activeCardId)
  }, [deck, activeCardId])

  const activeCard =
    deck && activeIndex >= 0 ? deck.cards[activeIndex] : deck?.cards[0]

  // Map all cards in the deck for search select
  const allCards = useMemo(() => {
    if (!deck || !activeCard) return []
    return deck.cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => card.id !== activeCard.id)
      .map(({ card, index }) => ({
        value: card.id,
        label: cardOptionLabel(card, index),
        keywords: `${card.frontPlain} ${card.backPlain} ${card.front} ${card.back}`,
      }))
  }, [deck, activeCard])

  if (!deck || !activeCard) {
    return <Navigate to="/" replace />
  }

  const collection = getCollection(loadStore(), deck.collectionId)
  // Resolved index of the active card in the deck (used for navigation)
  const resolvedIndex =
    activeIndex >= 0
      ? activeIndex
      : deck.cards.findIndex((card) => card.id === activeCard.id)

  const handleImportClick = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const raw = await file.text()
      const result = importDeckFromJson(raw, deckId)
      if (!result.ok) {
        setImportError(result.error)
        return
      }

      setImportError(null)
      reload()
    } catch {
      setImportError('Could not read that file.')
    }
  }

  const handleAddCard = () => {
    const id = addCard()
    setEditorMode('edit')
    setActiveCardId(id)
    setCardQuery('')
  }

  const handleRemoveCard = () => {
    const nextId =
      deck.cards[resolvedIndex + 1]?.id ?? deck.cards[resolvedIndex - 1]?.id
    removeCard(activeCard.id)
    setEditorMode('preview')
    if (nextId) setActiveCardId(nextId)
    setCardQuery('')
  }

  const handlePreviousCard = () => {
    const previous = deck.cards[resolvedIndex - 1]
    if (!previous) return
    setEditorMode('preview')
    setActiveCardId(previous.id)
    setCardQuery('')
  }

  const handleNextCard = () => {
    const next = deck.cards[resolvedIndex + 1]
    if (!next) return
    setEditorMode('preview')
    setActiveCardId(next.id)
    setCardQuery('')
  }

  return (
    // TODO: pass deck + apply-draft handlers once ChatDrawer can propose cards
    <ChatDrawer open={agentOpen} onClose={() => setAgentOpen(false)}>
      <Page>
        <Header>
          <BackLink to="/">← Decks</BackLink>
          <TitleRow>
            <div>
              <Brand>{deck.title || 'Untitled deck'}</Brand>
              <Subtitle>
                Collection: {collection?.name ?? 'Default'} · add cards and
                export JSON
              </Subtitle>
            </div>
            <HeaderActions>
              <Button
                type="button"
                variant={agentOpen ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAgentOpen((current) => !current)}
              >
                Agent
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate(`/decks/${deck.id}/practice`)}
              >
                Practice
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleImportClick}
              >
                Import JSON
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setJsonModalOpen(true)}
              >
                View JSON
              </Button>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
              />
            </HeaderActions>
          </TitleRow>
          {importError && <ImportError role="alert">{importError}</ImportError>}
        </Header>

        <EditorSection>
          <Toolbar>
            <CardPicker>
              <SearchSelect
                placeholder="Search other cards in this deck…"
                value={cardQuery}
                options={allCards}
                onChange={setCardQuery}
                onSelectOption={(option) => {
                  setEditorMode('preview')
                  setActiveCardId(option.value)
                  setCardQuery('')
                }}
                allowCreate={false}
                emptyMessage={
                  deck.cards.length <= 1
                    ? 'No other cards in this deck'
                    : 'No matching cards'
                }
                menuSize="lg"
              />
            </CardPicker>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddCard}
            >
              Add card
            </Button>
          </Toolbar>

          <ActiveEditor>
            <CardEditor
              key={`${activeCard.id}-${editorMode}`}
              card={activeCard}
              index={resolvedIndex}
              total={deck.cards.length}
              initialMode={editorMode}
              onChange={(patch) => updateCard(activeCard.id, patch)}
              onRemove={handleRemoveCard}
              onPreviousCard={handlePreviousCard}
              onNextCard={handleNextCard}
            />
          </ActiveEditor>
        </EditorSection>

        <Modal
          open={jsonModalOpen}
          title="JSON output"
          onClose={() => setJsonModalOpen(false)}
          maxWidth="40rem"
        >
          <JsonPreview
            json={json}
            copyStatus={copyStatus}
            onCopy={copyJson}
            onDownload={downloadJson}
          />
        </Modal>
      </Page>
    </ChatDrawer>
  )
}

export default CardBuilderPage

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

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`

const HiddenFileInput = styled.input`
  display: none;
`

const ImportError = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
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
  max-width: 36rem;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

const EditorSection = styled(Card)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const Toolbar = styled.div`
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const CardPicker = styled.div`
  flex: 1;
  min-width: min(100%, 16rem);
`

const ActiveEditor = styled.div`
  flex: 1;
  min-height: 22rem;
  display: flex;
  flex-direction: column;
`
