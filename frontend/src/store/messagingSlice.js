import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as messagesApi from '../api/messages.js'

// ── Thunks ────────────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  'messaging/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await messagesApi.getConversations()
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load conversations')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'messaging/fetchMessages',
  async ({ conversationId, page = 0 }, { rejectWithValue }) => {
    try {
      const { data } = await messagesApi.getMessages(conversationId, page)
      return { conversationId, page, ...data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load messages')
    }
  }
)

export const sendMessageThunk = createAsyncThunk(
  'messaging/sendMessage',
  async ({ recipientId, content }, { rejectWithValue }) => {
    try {
      const { data } = await messagesApi.sendMessage(recipientId, content)
      return data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message')
    }
  }
)

export const markReadThunk = createAsyncThunk(
  'messaging/markRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      await messagesApi.markRead(conversationId)
      return conversationId
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark read')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────

const messagingSlice = createSlice({
  name: 'messaging',
  initialState: {
    conversations:      [],         // ConversationDto[]
    activeConversationId: null,
    // messages keyed by conversationId: { items: [], totalPages, page }
    messagesByConv:     {},
    conversationsLoaded: false,
    loading:            false,
    error:              null,
    // Typing: { [conversationId]: { username, isTyping } }
    typing:             {},
  },
  reducers: {
    setActiveConversation(state, { payload }) {
      state.activeConversationId = payload
    },
    // Called when a WS message arrives
    receiveWsMessage(state, { payload: message }) {
      const cid = message.conversationId
      if (state.messagesByConv[cid]) {
        const exists = state.messagesByConv[cid].items.some(m => m.id === message.id)
        if (!exists) state.messagesByConv[cid].items.push(message)
      }
      // Bubble conversation to top
      const idx = state.conversations.findIndex(c => c.id === cid)
      if (idx > -1) {
        const conv = { ...state.conversations[idx], lastMessageContent: message.content, lastMessageAt: message.createdAt }
        state.conversations.splice(idx, 1)
        state.conversations.unshift(conv)
      }
    },
    setTyping(state, { payload: { conversationId, username, isTyping } }) {
      state.typing[conversationId] = isTyping ? { username } : null
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending,   (state) => { state.loading = true })
      .addCase(fetchConversations.fulfilled, (state, { payload }) => {
        state.loading = false
        state.conversations = payload
        state.conversationsLoaded = true
      })
      .addCase(fetchConversations.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })

      // fetchMessages
      .addCase(fetchMessages.pending, (state) => { state.loading = true })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        state.loading = false
        const { conversationId, content, totalPages, number: page } = payload
        if (page === 0) {
          state.messagesByConv[conversationId] = { items: content, totalPages, page }
        } else {
          // Prepend older messages (infinite scroll upward)
          state.messagesByConv[conversationId] = {
            items: [...content, ...(state.messagesByConv[conversationId]?.items ?? [])],
            totalPages,
            page,
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, { payload }) => {
        state.loading = false; state.error = payload
      })

      // sendMessageThunk
      .addCase(sendMessageThunk.fulfilled, (state, { payload: message }) => {
        const cid = message.conversationId
        if (!state.messagesByConv[cid]) state.messagesByConv[cid] = { items: [], totalPages: 1, page: 0 }
        const exists = state.messagesByConv[cid].items.some(m => m.id === message.id)
        if (!exists) state.messagesByConv[cid].items.push(message)
        // Refresh conversation preview
        const idx = state.conversations.findIndex(c => c.id === cid)
        if (idx > -1) {
          const conv = { ...state.conversations[idx], lastMessageContent: message.content, lastMessageAt: message.createdAt, unreadCount: 0 }
          state.conversations.splice(idx, 1)
          state.conversations.unshift(conv)
        }
      })

      // markReadThunk
      .addCase(markReadThunk.fulfilled, (state, { payload: cid }) => {
        const idx = state.conversations.findIndex(c => c.id === cid)
        if (idx > -1) state.conversations[idx] = { ...state.conversations[idx], unreadCount: 0 }
      })
  },
})

export const { setActiveConversation, receiveWsMessage, setTyping, clearError } = messagingSlice.actions

// Selectors
export const selectConversations       = (s) => s.messaging.conversations
export const selectActiveConversationId = (s) => s.messaging.activeConversationId
export const selectMessagesForConv     = (cid) => (s) => s.messaging.messagesByConv[cid]
export const selectMessagingLoading    = (s) => s.messaging.loading
export const selectTyping              = (cid) => (s) => s.messaging.typing[cid]
export const selectTotalUnread         = (s) =>
  s.messaging.conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)

export default messagingSlice.reducer
