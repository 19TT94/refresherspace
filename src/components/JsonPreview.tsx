import styled from 'styled-components'

// Components
import { Button } from './ui'

interface JsonPreviewProps {
  json: string
  copyStatus: 'idle' | 'copied' | 'error'
  onCopy: () => void
  onDownload: () => void
}

const JsonPreview = ({
  json,
  copyStatus,
  onCopy,
  onDownload,
}: JsonPreviewProps) => {
  const copyLabel =
    copyStatus === 'copied'
      ? 'Copied'
      : copyStatus === 'error'
        ? 'Copy failed'
        : 'Copy JSON'

  return (
    <Content>
      <Actions>
        <Button type="button" variant="secondary" size="sm" onClick={onCopy}>
          {copyLabel}
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={onDownload}>
          Download
        </Button>
      </Actions>
      <Pre aria-label="Deck JSON">{json}</Pre>
    </Content>
  )
}

export default JsonPreview

// Style Overrides

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`

const Pre = styled.pre`
  margin: 0;
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.tertiary};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: 1.55;
  overflow: auto;
  max-height: min(28rem, 55vh);
  white-space: pre-wrap;
  word-break: break-word;
`
