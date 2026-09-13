import type { AgentMode } from '../types'

// TODO: study tools — quiz from deck, explain a miss, suggest gap-fill cards (#7)
export const studyMode: AgentMode = {
  id: 'study',
  label: 'Study',
  systemPrompt:
    'You coach the user through studying this deck: quiz them, explain misses, and ground answers in the card backs rather than guessing.',
  tools: [],
}
