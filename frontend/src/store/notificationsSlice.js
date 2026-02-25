import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as notifApi from '../api/notifications.js'

export const fetchUnreadCount  = createAsyncThunk('notifications/unreadCount', async () => {
  const { data } = await notifApi.getUnreadCount()
  return data.count
})

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (page = 0) => {
  const { data } = await notifApi.getNotifications(page)
  return { ...data, page }
})

export const markAllReadThunk = createAsyncThunk('notifications/markAllRead', async () => {
  await notifApi.markAllRead()
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:       [],
    unreadCount: 0,
    totalPages:  0,
    loading:     false,
  },
  reducers: {
    // Called by WebSocket hook when a real-time notification arrives
    addNotification(state, { payload }) {
      state.items.unshift(payload)
      if (!payload.read) state.unreadCount += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload
      })
      .addCase(fetchNotifications.pending, (state) => { state.loading = true })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading    = false
        state.totalPages = payload.totalPages
        if (payload.page === 0) state.items = payload.content
        else state.items = [...state.items, ...payload.content]
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false })
      .addCase(markAllReadThunk.fulfilled, (state) => {
        state.unreadCount = 0
        state.items = state.items.map(n => ({ ...n, read: true }))
      })
  },
})

export const { addNotification } = notificationsSlice.actions
export const selectNotifications = (s) => s.notifications.items
export const selectUnreadCount   = (s) => s.notifications.unreadCount
export const selectNotifLoading  = (s) => s.notifications.loading
export default notificationsSlice.reducer
