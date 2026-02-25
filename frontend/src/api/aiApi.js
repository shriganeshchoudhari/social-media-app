/**
 * AI API client — streaming chat with Spark (Ollama-powered).
 *
 * Uses the Fetch API with ReadableStream to consume NDJSON tokens from
 * POST /api/v1/ai/chat as they arrive.
 *
 * Each line of the response is a JSON object:
 *   Token:  {"delta":"<text>"}
 *   End:    {"done":true}
 *   Error:  {"error":"rate_limit","message":"..."}  or  {"error":"ai_unavailable",...}
 */

/**
 * Async generator that yields token strings from the streaming AI response.
 *
 * @param {string} message          - User's current message
 * @param {Array}  conversationHistory - Previous turns [{role, content}, ...]
 * @param {string} context          - "general" | "feed_summary" | "post_improve"
 * @yields {string} token           - Each streamed text token
 * @throws {AiError}                - On HTTP errors or stream errors
 *
 * Usage:
 *   for await (const token of streamChatMessage(msg, history, ctx)) {
 *     dispatch(appendStreamChunk(token))
 *   }
 */
export async function* streamChatMessage(message, conversationHistory = [], context = 'general') {
  const token = localStorage.getItem('token')
  if (!token) throw new AiError(401, 'Not authenticated')

  let response
  try {
    response = await fetch('/api/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, conversationHistory, context }),
    })
  } catch (networkErr) {
    throw new AiError(0, 'Network error — is the backend running?')
  }

  // Non-streaming error responses (401, 422, etc.)
  if (!response.ok) {
    let msg = `HTTP ${response.status}`
    try {
      const err = await response.json()
      msg = err.message || err.error || msg
    } catch (_) {}
    throw new AiError(response.status, msg)
  }

  // Consume the NDJSON stream line by line
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Process all complete lines in the buffer
    const lines = buffer.split('\n')
    buffer = lines.pop() // last element may be incomplete

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      let data
      try {
        data = JSON.parse(trimmed)
      } catch (_) {
        continue // skip unparseable lines
      }

      // Error written into the stream (rate limit, Ollama down)
      if (data.error) {
        throw new AiError(
          data.error === 'rate_limit' ? 429 : 503,
          data.message || 'AI assistant is temporarily unavailable',
          { retryable: !!data.retryable, resetAt: data.resetAt }
        )
      }

      if (data.done) return

      if (data.delta) {
        yield data.delta
      }
    }
  }
}

/**
 * Check whether the AI assistant (Ollama) is healthy.
 * Returns the response body or null on network failure.
 */
export async function checkAiHealth() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const res = await fetch('/api/v1/ai/health', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    return await res.json()
  } catch (_) {
    return null
  }
}

// ── Error class ────────────────────────────────────────────────────────────

export class AiError extends Error {
  constructor(statusCode, message, meta = {}) {
    super(message)
    this.name = 'AiError'
    this.statusCode = statusCode
    this.retryable = meta.retryable ?? (statusCode === 503)
    this.resetAt = meta.resetAt ?? null
  }
}
