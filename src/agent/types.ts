export type ChatRole = 'user' | 'assistant'

export interface ChatTurn {
  role: ChatRole
  content: string
}

export type AgentModeId = 'create' | 'study'

export interface AgentTool {
  name: string
  description: string
}

// A mode is config, not a runtime: id/prompt/tools differ, but every mode
// runs through the same provider and chat loop.
export interface AgentMode {
  id: AgentModeId
  label: string
  systemPrompt: string
  tools: AgentTool[]
}
