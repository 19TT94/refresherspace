export const OLLAMA_MODEL = 'llama3.2'
export const OLLAMA_CHAT_URL = '/ollama/v1/chat/completions'

const SYSTEM_PROMPT =
  'You are a teacher/tutor whose goal is to help build and practice flashcards. You help the user author flashcards in Refresherspace. Reply in concise plain language. You cannot change the deck; only the user can apply changes.'

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readErrorMessage = (body: unknown): string | null => {
  if (!isRecord(body) || !('error' in body)) return null

  const error = body.error
  if (typeof error === 'string' && error.trim()) return error.trim()
  if (
    isRecord(error) &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message.trim()
  }

  return null
}

const unreachableMessage =
  'Could not reach Ollama. Start it with `ollama serve` and try again.'

const parseFailure = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json()
    const fromBody = readErrorMessage(body)
    if (fromBody) return fromBody
  } catch {
    // Ignore empty or non-JSON error bodies from the Vite proxy.
  }

  if (response.status >= 500) return unreachableMessage
  return `Ollama request failed (${response.status}).`
}

export const chatWithOllama = async (
  turns: ChatTurn[],
  signal?: AbortSignal,
): Promise<string> => {
  // TODO: replace this hardcoded client with the BYOK/proxy client (#5 / #11)
  let response: Response

  try {
    response = await fetch(OLLAMA_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...turns.map((turn) => ({
            role: turn.role,
            content: turn.content,
          })),
        ],
      }),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new Error(unreachableMessage)
  }

  if (!response.ok) {
    throw new Error(await parseFailure(response))
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('Ollama returned a reply that could not be read.')
  }

  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new Error('Ollama returned an empty reply.')
  }

  const first = payload.choices[0]
  const content =
    isRecord(first) &&
    isRecord(first.message) &&
    typeof first.message.content === 'string'
      ? first.message.content.trim()
      : ''

  if (!content) {
    throw new Error('Ollama returned an empty reply.')
  }

  return content
}
