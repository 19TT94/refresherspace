import { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

// Components
import ChatDrawer from '../components/ChatDrawer'
import {
  Button,
  Card,
  CardTitle,
  Help,
  Input,
  Markdown,
  Modal,
  SearchSelect,
  Textarea,
} from '../components/ui'

// Styles
import { theme } from '../styles/theme'

const themeColors = [
  { name: 'background', value: theme.colors.background },
  { name: 'surface', value: theme.colors.surface },
  { name: 'surfaceHover', value: theme.colors.surfaceHover },
  { name: 'primary', value: theme.colors.primary },
  { name: 'primarySoft', value: theme.colors.primarySoft },
  { name: 'secondary', value: theme.colors.secondary },
  { name: 'tertiary', value: theme.colors.tertiary },
  { name: 'muted', value: theme.colors.muted },
  { name: 'border', value: theme.colors.border },
  { name: 'success', value: theme.colors.success },
  { name: 'danger', value: theme.colors.danger },
  { name: 'accent', value: theme.colors.accent },
  { name: 'text', value: theme.colors.text },
  { name: 'inputBg', value: theme.colors.inputBg },
]

const searchSelectOptions = [
  { value: 'default', label: 'Default' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'dsa', label: 'DSA patterns' },
]

const markdownSample = `**Stack** — last in, first out.

Use \`push\` and \`pop\`:

\`\`\`ts
const stack: number[] = []
stack.push(1)
\`\`\`
`

const ComponentLibrary = () => {
  const [collectionQuery, setCollectionQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false)

  return (
    <ChatDrawer open={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)}>
      <Page>
        <BackLink to="/">← Decks</BackLink>
        <div>
          <Brand>Refresherspace Component Library</Brand>
          <Subtitle>
            Browse the styled-components design system used across the app
          </Subtitle>
        </div>

        <ShowcaseSection>
          <ComponentName>Theme Colors</ComponentName>
          <TokenGrid>
            {themeColors.map((color) => (
              <ColorItem key={color.name}>
                <ColorSwatch $color={color.value} />
                <ColorLabel>{color.name}</ColorLabel>
              </ColorItem>
            ))}
          </TokenGrid>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Buttons</ComponentName>
          <ShowcaseGrid>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </ShowcaseGrid>
          <ShowcaseGrid>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </ShowcaseGrid>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Form Fields</ComponentName>
          <FormGrid>
            <Input label="Text input" placeholder="Enter text..." />
            <SearchSelect
              label="Search select"
              help={
                <Help title="Search select">
                  Type to filter options, or enter a new name to create one
                </Help>
              }
              placeholder="Search or create"
              value={collectionQuery}
              options={searchSelectOptions}
              onChange={setCollectionQuery}
              emptyMessage="No options yet"
            />
          </FormGrid>
          <Input label="With error" error="This field is required" />
          <Textarea
            label="Textarea"
            rows={3}
            placeholder="Multi-line text..."
          />
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Help</ComponentName>
          <HelpRow>
            <Muted>Hover or tap the icon for a tooltip</Muted>
            <Help title="Help">
              Help explains a nearby control. On compact screens it opens as a
              modal instead of a tooltip.
            </Help>
          </HelpRow>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Cards</ComponentName>
          <CardPad>
            <CardTitle>Card with title</CardTitle>
            <Muted>Used for deck lists, forms, and nested sections.</Muted>
          </CardPad>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Markdown</ComponentName>
          <CardPad>
            <Markdown>{markdownSample}</Markdown>
          </CardPad>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Modal</ComponentName>
          <ShowcaseGrid>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
          </ShowcaseGrid>
          <Modal
            open={modalOpen}
            title="Example modal"
            onClose={() => setModalOpen(false)}
          >
            <Muted>
              Dialogs sit on a backdrop and close on Escape or click-out.
            </Muted>
          </Modal>
        </ShowcaseSection>

        <ShowcaseSection>
          <ComponentName>Chat Drawer</ComponentName>
          <ShowcaseGrid>
            <Button
              variant={chatDrawerOpen ? 'primary' : 'secondary'}
              onClick={() => setChatDrawerOpen((current) => !current)}
            >
              {chatDrawerOpen ? 'Close chat drawer' : 'Open chat drawer'}
            </Button>
          </ShowcaseGrid>
          <Muted>
            Pushes page content aside. Drag the left edge to resize, or use
            arrow keys on the handle. Double-click the handle to reset. Messages
            stay local until an agent is connected.
          </Muted>
        </ShowcaseSection>
      </Page>
    </ChatDrawer>
  )
}

export default ComponentLibrary

// Style Overrides
const Page = styled.div`
  max-width: 56rem;
  margin: 0 auto;
  padding: ${({ theme }) =>
    `${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[12]}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[10]};
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

const Brand = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const ShowcaseSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const ShowcaseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`

const FormGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`

const ColorSwatch = styled.div<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

const ColorLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: ${({ theme }) => theme.spacing[1]};
`

const ColorItem = styled.div`
  text-align: center;
`

const TokenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
`

const ComponentName = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const CardPad = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`

const HelpRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`

const Muted = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`
