import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

// Utils
import { createDeck, getCollection, loadStore } from '../lib/store'

// Components
import {
  Button,
  Card,
  CardTitle,
  Help,
  Input,
  SearchSelect,
} from '../components/ui'

const DeckManagerPage = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [collectionQuery, setCollectionQuery] = useState('')
  const [store, setStore] = useState(() => loadStore())

  const collectionOptions = useMemo(
    () =>
      store.collections.map((collection) => ({
        value: collection.id,
        label: collection.name,
      })),
    [store.collections],
  )

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    const { store: nextStore, deck } = createDeck(
      loadStore(),
      title,
      collectionQuery,
    )
    setStore(nextStore)
    setTitle('')
    setCollectionQuery('')
    navigate(`/decks/${deck.id}`)
  }

  return (
    <Page>
      <Brand>RefresherSpace</Brand>

      <Section as="form" onSubmit={handleCreate}>
        <FormStack>
          <FormRow>
            <Input
              label="Deck"
              placeholder="e.g. Spanish verbs"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <SearchSelect
              label="Target collection"
              help={
                <Help title="Target collection" left>
                  Leave blank to use the Default collection
                </Help>
              }
              placeholder="Search or create a collection"
              value={collectionQuery}
              options={collectionOptions}
              onChange={setCollectionQuery}
              emptyMessage="No collections yet"
            />
          </FormRow>
          <Button type="submit" variant="primary" disabled={!title.trim()}>
            Create deck
          </Button>
        </FormStack>
      </Section>

      {store.decks.length > 0 && (
        <Section>
          <CardTitle>Your decks</CardTitle>
          <DeckList>
            {store.decks.map((deck) => {
              const collection = getCollection(store, deck.collectionId)
              return (
                <DeckRow key={deck.id}>
                  <DeckLink to={`/decks/${deck.id}`}>
                    <DeckName>{deck.title || 'Untitled deck'}</DeckName>
                    <DeckMeta>{collection?.name ?? 'Default'}</DeckMeta>
                  </DeckLink>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/decks/${deck.id}/practice`)}
                  >
                    Practice
                  </Button>
                </DeckRow>
              )
            })}
          </DeckList>
        </Section>
      )}
    </Page>
  )
}

export default DeckManagerPage

// Style Overrides
const Page = styled.div`
  max-width: 40rem;
  margin: 0 auto;
  padding: ${({ theme }) =>
    `${theme.spacing[6]} ${theme.spacing[4]} ${theme.spacing[12]}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`

const Brand = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`

const Section = styled(Card)`
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`

const FormRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`

const DeckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`

const DeckRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`

const DeckLink = styled(Link)`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-decoration: none;
  color: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`

const DeckName = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`

const DeckMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`
