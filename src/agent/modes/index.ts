import type { AgentMode, AgentModeId } from '../types'
import { createMode } from './create'
import { studyMode } from './study'

const AGENT_MODES: Record<AgentModeId, AgentMode> = {
  create: createMode,
  study: studyMode,
}

export const getAgentMode = (id: AgentModeId): AgentMode => AGENT_MODES[id]

export const listAgentModes = (): AgentMode[] => Object.values(AGENT_MODES)
