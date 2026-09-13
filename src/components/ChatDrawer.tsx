import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type SubmitEvent,
  type ReactNode,
} from 'react'
import styled from 'styled-components'

// Components
import { Button, CardTitle } from './ui'

// Utils
import { chatWithOllama } from '../lib/ollamaChat'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  error?: boolean
}

interface ChatDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

// TODO: accept deck context (title, collection, cards) so the model can list/propose without guessing
// TODO: expose a draft-cards callback so Card Builder can Apply through the existing store
// TODO: replace the hardcoded Ollama client with the BYOK/proxy client (#5 / #11)
// TODO: tool schemas — list_cards, propose_cards, update_draft (see docs/agent.md)
// TODO: disclose when card text leaves the device once BYOK/cloud is wired

const SLIDE_MS = 220
const DEFAULT_WIDTH = 416
const MIN_WIDTH = 256
const MIN_MAIN = 320
const RESIZE_STEP = 24
const RESIZE_STEP_LARGE = 96

const CloseIcon = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const maxDrawerWidth = () => {
  const viewport = window.innerWidth
  if (viewport < MIN_WIDTH + MIN_MAIN) {
    return Math.max(MIN_WIDTH, viewport - 16)
  }
  return viewport - MIN_MAIN
}

const clampWidth = (value: number) =>
  Math.min(maxDrawerWidth(), Math.max(MIN_WIDTH, value))

const ChatDrawer = ({
  open,
  onClose,
  title = 'Agent',
  children,
}: ChatDrawerProps) => {
  const titleId = useId()
  const composerId = useId()
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH })
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [dragging, setDragging] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleResize = () => setWidth((current) => clampWidth(current))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!open) return
    composerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, open, pending])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    if (!dragging) return

    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
    }
  }, [dragging])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    draggingRef.current = true
    dragRef.current = { startX: event.clientX, startWidth: width }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const delta = dragRef.current.startX - event.clientX
    setWidth(clampWidth(dragRef.current.startWidth + delta))
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleResizeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setWidth((current) => clampWidth(current + RESIZE_STEP))
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setWidth((current) => clampWidth(current - RESIZE_STEP))
      return
    }
    if (event.key === 'PageUp') {
      event.preventDefault()
      setWidth((current) => clampWidth(current + RESIZE_STEP_LARGE))
      return
    }
    if (event.key === 'PageDown') {
      event.preventDefault()
      setWidth((current) => clampWidth(current - RESIZE_STEP_LARGE))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setWidth(MIN_WIDTH)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setWidth(maxDrawerWidth())
    }
  }

  const sendMessage = useCallback(async () => {
    const content = draft.trim()
    if (!content || pending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    const history = [...messages, userMessage]
    setMessages(history)
    setDraft('')
    setPending(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const turns = history
      .filter((message) => !message.error)
      .map((message) => ({ role: message.role, content: message.content }))

    try {
      const reply = await chatWithOllama(turns, controller.signal)
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: reply },
      ])
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Could not reach Ollama. Start it with `ollama serve` and try again.'
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: message,
          error: true,
        },
      ])
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setPending(false)
      }
    }
  }, [draft, messages, pending])

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage()
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    sendMessage()
  }

  return (
    <Shell>
      <Main>{children}</Main>
      <Frame
        $open={open}
        $width={width}
        $dragging={dragging}
        role="complementary"
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <ResizeHandle
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize agent panel"
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={maxDrawerWidth()}
          aria-valuenow={width}
          tabIndex={open ? 0 : -1}
          $dragging={dragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => setWidth(clampWidth(DEFAULT_WIDTH))}
          onKeyDown={handleResizeKeyDown}
        />
        <Panel>
          <Header>
            <CardTitle id={titleId}>{title}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Close"
              onClick={onClose}
            >
              <CloseIcon />
            </Button>
          </Header>

          <Thread aria-busy={pending}>
            {messages.length === 0 ? (
              <Empty>
                <EmptyTitle>Start a conversation</EmptyTitle>
                <EmptyCopy>
                  Ask to draft cards from notes, expand this deck, or tighten
                  wording. Replies come from Ollama on this machine.
                </EmptyCopy>
              </Empty>
            ) : (
              <MessageList>
                {messages.map((message) => (
                  <MessageItem key={message.id} $role={message.role}>
                    <Bubble
                      $role={message.role}
                      $error={Boolean(message.error)}
                    >
                      {message.content}
                    </Bubble>
                  </MessageItem>
                ))}
                {pending ? (
                  <MessageItem $role="assistant">
                    <PendingBubble>Thinking…</PendingBubble>
                  </MessageItem>
                ) : null}
              </MessageList>
            )}
            <div ref={bottomRef} />
          </Thread>

          <Composer onSubmit={handleSubmit}>
            <ComposerField
              ref={composerRef}
              id={composerId}
              aria-label="Message"
              rows={2}
              tabIndex={open ? 0 : -1}
              value={draft}
              placeholder="Message the agent…"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
            />
            <ComposerFooter>
              <Hint>Enter to send · Shift+Enter for a new line</Hint>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!draft.trim() || pending}
              >
                {pending ? 'Sending' : 'Send'}
              </Button>
            </ComposerFooter>
          </Composer>
        </Panel>
      </Frame>
    </Shell>
  )
}

export default ChatDrawer

// Style Overrides

const Shell = styled.div`
  display: flex;
  align-items: stretch;
  min-height: 100dvh;
`

const Main = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
`

const Frame = styled.aside<{
  $open: boolean
  $width: number
  $dragging: boolean
}>`
  position: sticky;
  top: 0;
  z-index: ${({ $open }) => ($open ? 2 : 'auto')};
  display: flex;
  flex: 0 0 ${({ $open, $width }) => ($open ? `${$width}px` : '0px')};
  align-self: flex-start;
  height: 100dvh;
  width: ${({ $open, $width }) => ($open ? `${$width}px` : '0')};
  min-width: 0;
  max-width: ${({ $open, $width }) => ($open ? `${$width}px` : '0')};
  overflow: hidden;
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  background: ${({ theme }) => theme.colors.surface};
  border-left: ${({ theme, $open }) =>
    $open ? `1px solid ${theme.colors.border}` : '0'};
  box-shadow: ${({ theme, $open }) => ($open ? theme.shadows.sm : 'none')};
  transition: ${({ $dragging }) =>
    $dragging
      ? 'none'
      : `width ${SLIDE_MS}ms ease, max-width ${SLIDE_MS}ms ease, flex-basis ${SLIDE_MS}ms ease, border-left-width ${SLIDE_MS}ms ease`};
`

const ResizeHandle = styled.div<{ $dragging: boolean }>`
  flex-shrink: 0;
  width: 0.625rem;
  cursor: col-resize;
  touch-action: none;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.25rem;
    height: 2.5rem;
    border-radius: ${({ theme }) => theme.radii.full};
    background: ${({ theme, $dragging }) =>
      $dragging ? theme.colors.primary : theme.colors.border};
    transform: translate(-50%, -50%);
    transition:
      background-color 0.15s ease,
      height 0.15s ease;
  }

  &:hover::before,
  &:focus-visible::before {
    background: ${({ theme }) => theme.colors.primary};
    height: 3.5rem;
  }
`

const Panel = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) =>
    `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[3]}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Thread = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[4]};
`

const Empty = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-align: center;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`

const EmptyCopy = styled.p`
  margin: 0 auto;
  max-width: 20rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const MessageList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`

const MessageItem = styled.li<{ $role: ChatRole }>`
  display: flex;
  justify-content: ${({ $role }) =>
    $role === 'user' ? 'flex-end' : 'flex-start'};
`

const Bubble = styled.div<{ $role: ChatRole; $error?: boolean }>`
  max-width: 85%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: ${({ theme, $error }) =>
    $error ? theme.colors.danger : theme.colors.text};
  background: ${({ theme, $role }) =>
    $role === 'user' ? theme.colors.primarySoft : theme.colors.surfaceHover};
  border: ${({ theme, $error }) =>
    $error ? `1px solid ${theme.colors.danger}` : '1px solid transparent'};
`

const PendingBubble = styled.div`
  max-width: 85%;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
  font-style: italic;
  color: ${({ theme }) => theme.colors.muted};
  background: ${({ theme }) => theme.colors.surfaceHover};
`

const Composer = styled.form`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const ComposerField = styled.textarea`
  width: 100%;
  resize: none;
  padding: 0.625rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.45;

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`

const ComposerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  flex-wrap: wrap;
`

const Hint = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`
