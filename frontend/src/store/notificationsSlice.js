import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as notifApi from '../api/notifications.js'

// ── Async thunks ──────────────────────────────────────────────

export const fetchUnreadCount = createAsyncThunk('notifications/unreadCount', async () => {
  const { data } = await notifApi.getUnreadCount()
  return data.count
})

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 0, unreadOnly = false, type = null } = {}) => {
    const { data } = await notifApi.getNotifications(page, { unreadOnly, type })
    return { ...data, page }
  }
)

export const markAllReadThunk = createAsyncThunk('notifications/markAllRead', async () => {
  await notifApi.markAllRead()
})

export const markReadThunk = createAsyncThunk('notifications/markRead', async (id) => {
  await notifApi.markRead(id)
  return id
})

export const deleteNotificationThunk = createAsyncThunk(
  'notifications/delete',
  async (id) => {
    await notifApi.deleteNotification(id)
    return id
  }
)

export const clearAllThunk = createAsyncThunk('notifications/clearAll', async () => {
  await notifApi.clearAllNotifications()
})

// ── Slice ─────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:        [],
    unreadCount:  0,
    totalPages:   0,
    currentPage:  0,
    activeFilter: 'all',   // 'all' | 'unread'
    loading:      false,
  },
  reducers: {
    /** Called by WebSocket hook when a real-time notification arrives. */
    addNotification(state, { payload }) {
      // Avoid duplicates (e.g. WS fires just before page poll returns)
      if (state.items.some(n => n.id === payload.id)) return
      state.items.unshift(payload)
      if (!payload.read) state.unreadCount += 1
    },
    setActiveFilter(state, { payload }) {
      state.activeFilter = payload
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch unread count ───────────────────────────────────
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload
      })

      // ── Fetch page ───────────────────────────────────────────
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true })
      .addCase(fetchNotifications.rejected,  (state) => { state.loading = false })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading    = false
        state.totalPages = payload.totalPages
        state.currentPage = payload.page
        // Page 0 replaces; subsequent pages append (load more)
        if (payload.page === 0) {
          state.items = payload.content
        } else {
          // Deduplicate in case of WS additions between pages
          const existingIds = new Set(state.items.map(n => n.id))
          const fresh = payload.content.filter(n => !existingIds.has(n.id))
          state.items = [...state.items, ...fresh]
        }
      })

      // ── Mark all read ────────────────────────────────────────
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.unreadCount = 0
        state.items = state.items.map(n => ({ ...n, read: true }))
      })

      // ── Mark single read ─────────────────────────────────────
      .addCase(markReadThunk.fulfilled, (state, { payload: id }) => {
        const item = state.items.find(n => n.id === id)
        if (item && !item.read) {
          item.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // ── Delete single ────────────────────────────────────────
      .addCase(deleteNotificationThunk.fulfilled, (state, { payload: id }) => {
        const item = state.items.find(n => n.id === id)
        if (item && !item.read) state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.items = state.items.filter(n => n.id !== id)
      })

      // ── Clear all ────────────────────────────────────────────
      .addCase(clearAllThunk.fulfilled, (state) => {
        state.items       = []
        state.unreadCount = 0
        state.totalPages  = 0
        state.currentPage = 0
      })
  },
})

export const { addNotification, setActiveFilter } = notificationsSlice.actions

// ── Selectors ─────────────────────────────────────────────────
export const selectNotifications = (s) => s.notifications.items
export const selectUnreadCount   = (s) => s.notifications.unreadCount
export const selectNotifLoading  = (s) => s.notifications.loading
export const selectTotalPages    = (s) => s.notifications.totalPages
export const selectCurrentPage   = (s) => s.notifications.currentPage
export const selectActiveFilter  = (s) => s.notifications.activeFilter

export default notificationsSlice.reducer
