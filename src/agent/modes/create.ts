import type { AgentMode } from '../types'

// TODO: tool schemas — list_cards, propose_cards, update_draft (#12)
export const createMode: AgentMode = {
  id: 'create',
  label: 'Create',
  systemPrompt:
    'You help the user draft flashcards from notes, a topic, or an existing deck. Propose front/back pairs for review. You cannot write to the deck; only the user can apply a draft.',
  tools: [],
}
