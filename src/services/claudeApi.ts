/**
 * Direct fetch wrapper for the Anthropic Messages API.
 * The @anthropic-ai/sdk package is Node-only and cannot be used in browsers.
 * The anthropic-dangerous-direct-browser-access header is required to allow
 * browser-based requests to the Anthropic API (official Anthropic support for
 * client-side use cases).
 */

const API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

const SYSTEM_PROMPT = `You are a medical research assistant helping a patient advocate gather and organize information about treatment options and clinical trials. Your role is to help find, summarize, and analyze publicly available medical research and clinical trial information.

IMPORTANT: You are NOT providing medical advice. You are NOT a doctor. All information you provide is for research and informational purposes only, to help the advocate have informed conversations with the patient's medical team. Always frame your responses as "options to research further" or "questions to raise with the doctor" — never as recommendations or medical guidance.

Be thorough, accurate, and cite the type of sources where possible (e.g., clinical trial data, published research, case reports). If you are uncertain about something, say so clearly.`

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'ClaudeApiError'
  }
}

export async function callClaude(
  prompt: string,
  apiKey: string,
  onChunk?: (chunk: string) => void,
): Promise<string> {
  if (!apiKey) {
    throw new ClaudeApiError(
      'No API key configured. Please add your Claude API key in Settings.',
    )
  }

  const streaming = !!onChunk

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      stream: streaming,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    if (response.status === 401) {
      throw new ClaudeApiError(
        'Invalid API key. Please check your Claude API key in Settings.',
        401,
      )
    }
    if (response.status === 429) {
      throw new ClaudeApiError(
        'Rate limit reached. Please wait a moment and try again.',
        429,
      )
    }
    throw new ClaudeApiError(
      `API error (${response.status}): ${errorBody || 'Unknown error'}`,
      response.status,
    )
  }

  if (!streaming) {
    const data = await response.json() as { content: Array<{ type: string; text: string }> }
    return data.content[0]?.text ?? ''
  }

  // Streaming
  const reader = response.body?.getReader()
  if (!reader) throw new ClaudeApiError('No response body')

  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data) as {
          type: string
          delta?: { type: string; text: string }
        }
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          fullText += parsed.delta.text
          onChunk(parsed.delta.text)
        }
      } catch {
        // Ignore parse errors on malformed SSE lines
      }
    }
  }

  return fullText
}
