import { useState } from 'react'
import styled from 'styled-components'

// Components
import { Button, Card, Markdown, Modal } from './ui'

// Types
import type { Flashcard } from '../types/deck'

type FaceMode = 'edit' | 'preview'

interface CardEditorProps {
  card: Flashcard
  index: number
  total: number
  initialMode?: FaceMode
  onChange: (patch: Partial<Pick<Flashcard, 'front' | 'back'>>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const ChevronUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)

const CardEditor = ({
  card,
  index,
  total,
  initialMode = 'preview',
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: CardEditorProps) => {
  const [flipped, setFlipped] = useState(false)
  const [frontMode, setFrontMode] = useState<FaceMode>(initialMode)
  const [backMode, setBackMode] = useState<FaceMode>(initialMode)
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const sideLabel = flipped ? 'Back' : 'Front'
  const activeMode = flipped ? backMode : frontMode
  const setActiveMode = flipped ? setBackMode : setFrontMode

  const handleConfirmRemove = () => {
    setConfirmRemoveOpen(false)
    onRemove()
  }

  return (
    <EditorCard>
      <Header>
        <CardLabel>
          Card {index + 1}
          <SideBadge $flipped={flipped}>{sideLabel}</SideBadge>
        </CardLabel>
        <Actions>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move card ${index + 1} up`}
            title="Move up"
          >
            <ChevronUpIcon />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label={`Move card ${index + 1} down`}
            title="Move down"
          >
            <ChevronDownIcon />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmRemoveOpen(true)}
            disabled={total <= 1}
            aria-label={`Remove card ${index + 1}`}
            title="Remove"
            $danger
          >
            <TrashIcon />
          </IconButton>
        </Actions>
      </Header>

      <Scene>
        <Flipper $flipped={flipped}>
          <Face $side="front" aria-hidden={flipped}>
            <FaceTitle>Front</FaceTitle>
            {frontMode === 'edit' ? (
              <FaceTextarea
                aria-label={`Card ${index + 1} front markdown`}
                placeholder="Prompt — Markdown supported"
                value={card.front}
                onChange={(event) => onChange({ front: event.target.value })}
                tabIndex={flipped ? -1 : 0}
              />
            ) : (
              <PreviewPane>
                <Markdown emptyLabel="Front is empty">{card.front}</Markdown>
              </PreviewPane>
            )}
          </Face>
          <Face $side="back" aria-hidden={!flipped}>
            <FaceTitle>Back</FaceTitle>
            {backMode === 'edit' ? (
              <FaceTextarea
                aria-label={`Card ${index + 1} back markdown`}
                placeholder="Answer — Markdown supported"
                value={card.back}
                onChange={(event) => onChange({ back: event.target.value })}
                tabIndex={flipped ? 0 : -1}
              />
            ) : (
              <PreviewPane>
                <Markdown emptyLabel="Back is empty">{card.back}</Markdown>
              </PreviewPane>
            )}
          </Face>
        </Flipper>
      </Scene>

      <Footer>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setFlipped((value) => !value)}
          aria-pressed={flipped}
        >
          Flip to {flipped ? 'front' : 'back'}
        </Button>
        <ModeToggle>
          <Button
            type="button"
            variant={activeMode === 'edit' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveMode('edit')}
            aria-pressed={activeMode === 'edit'}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant={activeMode === 'preview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveMode('preview')}
            aria-pressed={activeMode === 'preview'}
          >
            Preview
          </Button>
        </ModeToggle>
        <Hint>
          Markdown on edit · preview renders · JSON keeps plain text too.
        </Hint>
      </Footer>

      <Modal
        open={confirmRemoveOpen}
        title="Remove card?"
        onClose={() => setConfirmRemoveOpen(false)}
        maxWidth="24rem"
      >
        <ConfirmCopy>
          Card {index + 1} will be permanently removed from this deck.
        </ConfirmCopy>
        <ConfirmActions>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setConfirmRemoveOpen(false)}
          >
            Cancel
          </Button>
          <DangerButton type="button" size="sm" onClick={handleConfirmRemove}>
            Remove card
          </DangerButton>
        </ConfirmActions>
      </Modal>
    </EditorCard>
  )
}

export default CardEditor

// Style Overrides

const EditorCard = styled(Card)`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const CardLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.muted};
`

const SideBadge = styled.span<{ $flipped: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ $flipped, theme }) =>
    $flipped ? theme.colors.primarySoft : theme.colors.surfaceHover};
  color: ${({ $flipped, theme }) =>
    $flipped ? theme.colors.primary : theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
`

const IconButton = styled(Button)<{ $danger?: boolean }>`
  min-height: 2.25rem;
  width: 2.25rem;
  padding: 0;

  ${({ $danger, theme }) =>
    $danger &&
    `
    &:hover:not(:disabled) {
      color: ${theme.colors.danger};
      background-color: ${theme.colors.surfaceHover};
    }
  `}
`

const ConfirmCopy = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
`

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-wrap: wrap;
`

const DangerButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.tertiary};
  border: 1px solid transparent;

  &:hover:not(:disabled) {
    filter: brightness(0.92);
  }
`

const Scene = styled.div`
  flex: 1;
  min-height: 0;
  perspective: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
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
  gap: ${({ theme }) => theme.spacing[2]};
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
`

const FaceTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`

const FaceTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 0;
  resize: none;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
  padding: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
    font-family: ${({ theme }) => theme.fonts.body};
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: none;
  }
`

const PreviewPane = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Footer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const ModeToggle = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing[1]};
`

const Hint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`
