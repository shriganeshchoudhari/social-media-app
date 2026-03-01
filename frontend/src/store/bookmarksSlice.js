import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as bookmarksApi from '../api/bookmarks.js'

export const toggleBookmarkThunk = createAsyncThunk(
  'bookmarks/toggle',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await bookmarksApi.toggleBookmark(postId)
      return { postId, bookmarked: data.data.bookmarked }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to bookmark')
    }
  }
)

export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetch',
  async (page = 0, { rejectWithValue }) => {
    try {
      const { data } = await bookmarksApi.getMyBookmarks(page)
      return { ...data.data, page }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bookmarks')
    }
  }
)

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    // Plain array of post IDs the current user has bookmarked (serializable)
    bookmarkedIds: [],
    // Bookmarks page
    posts:      [],
    totalPages: 0,
    loading:    false,
    error:      null,
  },
  reducers: {
    // Seed known bookmarked IDs (e.g. from profile/feed API responses)
    setBookmarkedIds(state, { payload: ids }) {
      state.bookmarkedIds = Array.isArray(ids) ? ids : []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleBookmarkThunk.fulfilled, (state, { payload: { postId, bookmarked } }) => {
        if (bookmarked) {
          if (!state.bookmarkedIds.includes(postId)) {
            state.bookmarkedIds.push(postId)
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(id => id !== postId)
          state.posts = state.posts.filter(p => p.id !== postId)
        }
      })

      .addCase(fetchBookmarks.pending,   (state) => { state.loading = true })
      .addCase(fetchBookmarks.fulfilled, (state, { payload }) => {
        state.loading = false
        state.totalPages = payload.totalPages
        if (payload.page === 0) {
          state.posts = payload.content
          // Seed bookmarkedIds from the fetched posts
          state.bookmarkedIds = payload.content.map(p => p.id)
        } else {
          state.posts = [...state.posts, ...payload.content]
          const newIds = payload.content.map(p => p.id)
          newIds.forEach(id => {
            if (!state.bookmarkedIds.includes(id)) state.bookmarkedIds.push(id)
          })
        }
      })
      .addCase(fetchBookmarks.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
      })
  },
})

export const { setBookmarkedIds } = bookmarksSlice.actions

export const selectBookmarkedIds   = (s) => s.bookmarks.bookmarkedIds
export const selectIsBookmarked    = (postId) => (s) => s.bookmarks.bookmarkedIds.includes(postId)
export const selectBookmarkPosts   = (s) => s.bookmarks.posts
export const selectBookmarkLoading = (s) => s.bookmarks.loading

export default bookmarksSlice.reducer
