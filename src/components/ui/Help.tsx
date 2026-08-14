import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import styled, { css } from 'styled-components'

interface HelpProps {
  children: ReactNode
  title?: string
  inverted?: boolean
  left?: boolean
}

const QuestionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="1em"
    height="1em"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
)

const useIsCompact = () => {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false,
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsCompact(media.matches)
    handleChange()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return isCompact
}

export const Help = ({
  children,
  title = 'Help',
  inverted = false,
  left = false,
}: HelpProps) => {
  const [visible, setVisible] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const isCompact = useIsCompact()

  useEffect(() => {
    if (!visible) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (wrapperRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setVisible(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [visible])

  return (
    <HelpWrapper ref={wrapperRef}>
      <IconButton
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={visible}
        $inverted={inverted}
        onClick={(event) => {
          event.stopPropagation()
          setVisible((open) => !open)
        }}
      >
        <QuestionIcon />
      </IconButton>
      {visible &&
        isCompact &&
        createPortal(
          <InfoModal ref={panelRef as Ref<HTMLDivElement>} role="status">
            <InfoCard>{children}</InfoCard>
          </InfoModal>,
          document.body,
        )}
      {visible && !isCompact && (
        <Info ref={panelRef as Ref<HTMLSpanElement>} $left={left} role="status">
          {children}
        </Info>
      )}
    </HelpWrapper>
  )
}

const HelpWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: min-content;
  z-index: 2;
`

const IconButton = styled.button<{ $inverted: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $inverted, theme }) =>
    $inverted ? theme.colors.tertiary : theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  line-height: 1;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
  }
`

const InfoModal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: rgba(26, 35, 50, 0.4);
`

const InfoCard = styled.p`
  margin: 0;
  max-width: 20rem;
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  box-shadow: ${({ theme }) => theme.shadows.card};
`

const Info = styled.span<{ $left: boolean }>`
  position: absolute;
  bottom: calc(100% + ${({ theme }) => theme.spacing[1]});
  left: calc(100% + ${({ theme }) => theme.spacing[1]});
  z-index: 30;
  width: max-content;
  max-width: 16rem;
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: 1.4;
  white-space: break-spaces;
  box-shadow: ${({ theme }) => theme.shadows.card};

  ${({ $left }) =>
    $left &&
    css`
      right: calc(100% + ${({ theme }) => theme.spacing[1]});
      left: unset;
    `}
`
