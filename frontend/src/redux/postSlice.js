import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '../services/postService';

export const fetchFeed = createAsyncThunk('posts/fetchFeed', async (page = 0, { rejectWithValue }) => {
  try {
    const res = await postService.getFeed(page);
    return { data: res.data, page }; // Page<PostResponse>
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load feed');
  }
});

export const fetchExplore = createAsyncThunk('posts/fetchExplore', async (page = 0, { rejectWithValue }) => {
  try {
    const res = await postService.getExplore(page);
    return { data: res.data, page };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load explore');
  }
});

export const fetchTrending = createAsyncThunk('posts/fetchTrending', async (page = 0, { rejectWithValue }) => {
  try {
    const res = await postService.getTrending(page);
    return { data: res.data, page };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load trending');
  }
});

export const createPost = createAsyncThunk('posts/create', async (postData, { rejectWithValue }) => {
  try {
    const res = await postService.createPost(postData);
    return res.data; // PostResponse
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create post');
  }
});

export const deletePost = createAsyncThunk('posts/delete', async (postId, { rejectWithValue }) => {
  try {
    await postService.deletePost(postId);
    return postId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
  }
});

export const likePost = createAsyncThunk('posts/like', async (postId, { rejectWithValue }) => {
  try {
    await postService.likePost(postId);
    return postId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to like post');
  }
});

export const unlikePost = createAsyncThunk('posts/unlike', async (postId, { rejectWithValue }) => {
  try {
    await postService.unlikePost(postId);
    return postId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to unlike post');
  }
});

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feed: [],
    explore: [],
    trending: [],
    loading: false,
    exploreLoading: false,
    trendingLoading: false,
    error: null,
    feedHasMore: true,
    exploreHasMore: true,
    trendingHasMore: true,
  },
  reducers: {
    clearFeed: (state) => {
      state.feed = [];
      state.feedHasMore = true;
    },
    updatePostInFeed: (state, action) => {
      const idx = state.feed.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.feed[idx] = action.payload;
      const idx2 = state.explore.findIndex(p => p.id === action.payload.id);
      if (idx2 !== -1) state.explore[idx2] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(fetchFeed.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        const { data, page } = action.payload;
        if (page === 0) {
          state.feed = data.content;
        } else {
          state.feed = [...state.feed, ...data.content];
        }
        state.feedHasMore = !data.last;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Explore
      .addCase(fetchExplore.pending, (state) => { state.exploreLoading = true; })
      .addCase(fetchExplore.fulfilled, (state, action) => {
        state.exploreLoading = false;
        const { data, page } = action.payload;
        if (page === 0) {
          state.explore = data.content;
        } else {
          state.explore = [...state.explore, ...data.content];
        }
        state.exploreHasMore = !data.last;
      })
      .addCase(fetchExplore.rejected, (state) => { state.exploreLoading = false; })
      // Trending
      .addCase(fetchTrending.pending, (state) => { state.trendingLoading = true; })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trendingLoading = false;
        const { data, page } = action.payload;
        if (page === 0) {
          state.trending = data.content;
        } else {
          state.trending = [...state.trending, ...data.content];
        }
        state.trendingHasMore = !data.last;
      })
      .addCase(fetchTrending.rejected, (state) => { state.trendingLoading = false; })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.feed.unshift(action.payload);
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.feed = state.feed.filter(p => p.id !== action.payload);
        state.explore = state.explore.filter(p => p.id !== action.payload);
        state.trending = state.trending.filter(p => p.id !== action.payload);
      })
      // Like
      .addCase(likePost.fulfilled, (state, action) => {
        [state.feed, state.explore, state.trending].forEach(arr => {
          const post = arr.find(p => p.id === action.payload);
          if (post) { post.likesCount += 1; post.isLikedByCurrentUser = true; }
        });
      })
      // Unlike
      .addCase(unlikePost.fulfilled, (state, action) => {
        [state.feed, state.explore, state.trending].forEach(arr => {
          const post = arr.find(p => p.id === action.payload);
          if (post) { post.likesCount = Math.max(0, post.likesCount - 1); post.isLikedByCurrentUser = false; }
        });
      });
  },
});

export const { clearFeed, updatePostInFeed } = postSlice.actions;
export default postSlice.reducer;
