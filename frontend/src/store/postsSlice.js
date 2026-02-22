import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as postsApi from '../api/posts.js'

export const fetchFeed = createAsyncThunk('posts/fetchFeed', async (page = 0, { rejectWithValue }) => {
  try {
    const { data } = await postsApi.getFeed(page)
    return { ...data, page }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load feed')
  }
})

export const createPostThunk = createAsyncThunk('posts/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await postsApi.createPost(payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create post')
  }
})

export const likePostThunk = createAsyncThunk('posts/like', async (id, { rejectWithValue }) => {
  try {
    const { data } = await postsApi.likePost(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to like post')
  }
})

export const unlikePostThunk = createAsyncThunk('posts/unlike', async (id, { rejectWithValue }) => {
  try {
    const { data } = await postsApi.unlikePost(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to unlike post')
  }
})

export const deletePostThunk = createAsyncThunk('posts/delete', async (id, { rejectWithValue }) => {
  try {
    await postsApi.deletePost(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete post')
  }
})

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    feed:         [],
    totalPages:   0,
    currentPage:  0,
    loading:      false,
    loadingMore:  false,
    error:        null,
  },
  reducers: {
    clearFeed(state) { state.feed = []; state.currentPage = 0; state.totalPages = 0 },
    optimisticLike(state, { payload: id }) {
      const p = state.feed.find(p => p.id === id)
      if (p && !p.likedByCurrentUser) { p.likedByCurrentUser = true; p.likesCount++ }
    },
    optimisticUnlike(state, { payload: id }) {
      const p = state.feed.find(p => p.id === id)
      if (p && p.likedByCurrentUser) { p.likedByCurrentUser = false; p.likesCount-- }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchFeed
      .addCase(fetchFeed.pending, (state, { meta }) => {
        if (meta.arg === 0) state.loading = true
        else state.loadingMore = true
        state.error = null
      })
      .addCase(fetchFeed.fulfilled, (state, { payload }) => {
        state.loading      = false
        state.loadingMore  = false
        state.totalPages   = payload.totalPages
        state.currentPage  = payload.page
        if (payload.page === 0) state.feed = payload.content
        else state.feed = [...state.feed, ...payload.content]
      })
      .addCase(fetchFeed.rejected, (state, { payload }) => {
        state.loading = state.loadingMore = false
        state.error = payload
      })

      // createPost — prepend optimistically
      .addCase(createPostThunk.fulfilled, (state, { payload }) => {
        state.feed.unshift(payload)
      })

      // like/unlike — replace the post in feed with server response
      .addCase(likePostThunk.fulfilled, (state, { payload }) => {
        const i = state.feed.findIndex(p => p.id === payload.id)
        if (i !== -1) state.feed[i] = payload
      })
      .addCase(unlikePostThunk.fulfilled, (state, { payload }) => {
        const i = state.feed.findIndex(p => p.id === payload.id)
        if (i !== -1) state.feed[i] = payload
      })

      // delete
      .addCase(deletePostThunk.fulfilled, (state, { payload: id }) => {
        state.feed = state.feed.filter(p => p.id !== id)
      })
  },
})

export const { clearFeed, optimisticLike, optimisticUnlike } = postsSlice.actions
export const selectFeed        = (s) => s.posts.feed
export const selectFeedLoading = (s) => s.posts.loading
export const selectLoadingMore = (s) => s.posts.loadingMore
export const selectTotalPages  = (s) => s.posts.totalPages
export const selectCurrentPage = (s) => s.posts.currentPage
export default postsSlice.reducer
