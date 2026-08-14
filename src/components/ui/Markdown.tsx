import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import styled from 'styled-components'

interface MarkdownProps {
  children: string
  emptyLabel?: string
}

export const Markdown = ({
  children,
  emptyLabel = 'Nothing here yet',
}: MarkdownProps) => {
  const source = children.trim()

  if (!source) {
    return <Empty>{emptyLabel}</Empty>
  }

  return (
    <MarkdownBody>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children: linkChildren }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {linkChildren}
            </a>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </MarkdownBody>
  )
}

const Empty = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-style: italic;
`

const MarkdownBody = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.45;
  overflow: auto;
  min-height: 8rem;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  p,
  ul,
  ol,
  pre,
  blockquote {
    margin: 0 0 ${({ theme }) => theme.spacing[3]};
  }

  ul,
  ol {
    padding-left: 1.25rem;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.9em;
    padding: 0.1em 0.35em;
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  pre {
    padding: ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.radii.md};
    background: ${({ theme }) => theme.colors.secondary};
    color: #e6edf3;
    overflow: auto;
  }

  pre code,
  pre code.hljs {
    display: block;
    padding: 0;
    background: transparent;
    color: inherit;
    overflow-x: auto;
  }

  /* highlight.js token colors (dark code panels) */
  .hljs-comment,
  .hljs-quote {
    color: #8b9bb4;
    font-style: italic;
  }

  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-addition {
    color: #ff7b72;
  }

  .hljs-number,
  .hljs-string,
  .hljs-meta .hljs-meta-string,
  .hljs-literal,
  .hljs-doctag,
  .hljs-regexp {
    color: #a5d6ff;
  }

  .hljs-title,
  .hljs-section,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #d2a8ff;
  }

  .hljs-attribute,
  .hljs-attr,
  .hljs-variable,
  .hljs-template-variable,
  .hljs-class .hljs-title,
  .hljs-type {
    color: #79c0ff;
  }

  .hljs-symbol,
  .hljs-bullet,
  .hljs-link,
  .hljs-meta,
  .hljs-selector-attr,
  .hljs-selector-pseudo,
  .hljs-built_in,
  .hljs-title.class_ {
    color: ${({ theme }) => theme.colors.primarySoft};
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
  }

  blockquote {
    padding-left: ${({ theme }) => theme.spacing[3]};
    border-left: 3px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.muted};
  }

  strong {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`
