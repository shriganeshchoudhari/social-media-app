import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import postsReducer from './postsSlice.js'
import notificationsReducer from './notificationsSlice.js'
import aiReducer from './aiSlice.js'
import messagingReducer from './messagingSlice.js'
import bookmarksReducer from './bookmarksSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
    ai: aiReducer,
    messaging: messagingReducer,
    bookmarks: bookmarksReducer,
  },
})
