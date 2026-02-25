import { createSlice } from '@reduxjs/toolkit'

/**
 * Redux slice for the Spark AI assistant.
 *
 * State shape:
 *   isOpen       — whether the chat panel is visible
 *   messages     — array of { id, role: 'user'|'assistant', content, isStreaming? }
 *   isStreaming   — true while waiting for/receiving tokens from Ollama
 *   error        — null | { message, retryable, resetAt }
 *   ollamaStatus — null | 'ok' | 'degraded'
 */
const initialState = {
  isOpen: false,
  messages: [],
  isStreaming: false,
  error: null,
  ollamaStatus: null,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // ── Panel visibility ────────────────────────────────────────────────────
    openAiPanel(state) {
      state.isOpen = true
      state.error = null
    },
    closeAiPanel(state) {
      state.isOpen = false
    },
    toggleAiPanel(state) {
      state.isOpen = !state.isOpen
    },

    // ── Messages ────────────────────────────────────────────────────────────
    addMessage(state, action) {
      // action.payload: { id, role, content }
      state.messages.push({ ...action.payload, isStreaming: false })
    },

    /**
     * Append a streamed token to the last assistant message.
     * If the last message is not an assistant message, create a placeholder.
     */
    appendStreamChunk(state, action) {
      const token = action.payload
      const last = state.messages[state.messages.length - 1]

      if (last && last.role === 'assistant' && last.isStreaming) {
        last.content += token
      } else {
        // Start a new streaming assistant message
        state.messages.push({
          id: `ai-${Date.now()}-${Math.random()}`,
          role: 'assistant',
          content: token,
          isStreaming: true,
        })
      }
    },

    /** Mark the last streaming message as complete. */
    finishStreaming(state) {
      const last = state.messages[state.messages.length - 1]
      if (last && last.isStreaming) {
        last.isStreaming = false
      }
      state.isStreaming = false
    },

    setStreaming(state, action) {
      state.isStreaming = action.payload
    },

    // ── Error ───────────────────────────────────────────────────────────────
    setError(state, action) {
      // action.payload: { message, retryable?, resetAt? } or null
      state.error = action.payload
      state.isStreaming = false

      // Remove incomplete streaming message on error
      const last = state.messages[state.messages.length - 1]
      if (last && last.isStreaming) {
        state.messages.pop()
      }
    },
    clearError(state) {
      state.error = null
    },

    // ── Ollama health ───────────────────────────────────────────────────────
    setOllamaStatus(state, action) {
      state.ollamaStatus = action.payload  // 'ok' | 'degraded'
    },

    // ── Conversation management ─────────────────────────────────────────────
    clearConversation(state) {
      state.messages = []
      state.error = null
    },
  },
})

export const {
  openAiPanel,
  closeAiPanel,
  toggleAiPanel,
  addMessage,
  appendStreamChunk,
  finishStreaming,
  setStreaming,
  setError,
  clearError,
  setOllamaStatus,
  clearConversation,
} = aiSlice.actions

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectAiOpen      = (state) => state.ai.isOpen
export const selectAiMessages  = (state) => state.ai.messages
export const selectAiStreaming = (state) => state.ai.isStreaming
export const selectAiError     = (state) => state.ai.error
export const selectOllamaStatus = (state) => state.ai.ollamaStatus

// ── Thunk: sendChatMessage ───────────────────────────────────────────────────

/**
 * Thunk that sends a message and streams the response into Redux state.
 *
 * @param {string} message
 * @param {string} context  — "general" | "feed_summary" | "post_improve"
 */
export function sendChatMessage(message, context = 'general') {
  return async (dispatch, getState) => {
    // Import here to avoid circular dependency
    const { streamChatMessage, AiError } = await import('../api/aiApi.js')

    const userMsgId = `user-${Date.now()}`
    dispatch(addMessage({ id: userMsgId, role: 'user', content: message }))
    dispatch(setStreaming(true))
    dispatch(clearError())

    // Build history from current messages (exclude the one we just added)
    const allMessages = selectAiMessages(getState())
    const history = allMessages
      .filter((m) => m.id !== userMsgId && !m.isStreaming)
      .slice(-20)  // cap at 20 messages (10 turns)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      for await (const token of streamChatMessage(message, history, context)) {
        dispatch(appendStreamChunk(token))
      }
      dispatch(finishStreaming())
    } catch (err) {
      const errorPayload = {
        message: err instanceof AiError
          ? err.message
          : 'Something went wrong — please try again',
        retryable: err?.retryable ?? true,
        resetAt: err?.resetAt ?? null,
      }
      dispatch(setError(errorPayload))
    }
  }
}

export default aiSlice.reducer
