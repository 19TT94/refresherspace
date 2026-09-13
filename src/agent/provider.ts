import type { ChatTurn } from './types'

// A provider only ever turns a chat history into reply text. It has no
// access to the deck store, so writing to the live deck stays an explicit,
// separate "Apply" step outside this layer (see docs/agent.md product
// principle #1) rather than something a provider or mode can do silently.
export interface AgentProvider {
  id: string
  chat: (turns: ChatTurn[], signal?: AbortSignal) => Promise<string>
}
