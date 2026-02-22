import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as authApi from '../api/auth.js'
import * as usersApi from '../api/users.js'

// Restore session from localStorage on load
const storedToken = localStorage.getItem('token')
const storedUser  = JSON.parse(localStorage.getItem('user') || 'null')

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const fetchMeThunk = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await usersApi.getMe()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            storedUser,
    token:           storedToken,
    isAuthenticated: !!storedToken,
    loading:         false,
    error:           null,
  },
  reducers: {
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError(state) { state.error = null },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    const onPending = (state) => { state.loading = true; state.error = null }
    const onRejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      // login
      .addCase(loginThunk.pending, onPending)
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading         = false
        state.token           = payload.token
        state.user            = payload.user ?? null
        state.isAuthenticated = true
        localStorage.setItem('token', payload.token)
        if (payload.user) localStorage.setItem('user', JSON.stringify(payload.user))
      })
      .addCase(loginThunk.rejected, onRejected)

      // register
      .addCase(registerThunk.pending, onPending)
      .addCase(registerThunk.fulfilled, (state, { payload }) => {
        state.loading         = false
        state.token           = payload.token
        state.user            = payload.user ?? null
        state.isAuthenticated = true
        localStorage.setItem('token', payload.token)
        if (payload.user) localStorage.setItem('user', JSON.stringify(payload.user))
      })
      .addCase(registerThunk.rejected, onRejected)

      // fetchMe
      .addCase(fetchMeThunk.fulfilled, (state, { payload }) => {
        state.user = payload
        localStorage.setItem('user', JSON.stringify(payload))
      })
  },
})

export const { logout, clearError, updateUser } = authSlice.actions
export const selectUser            = (s) => s.auth.user
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated
export const selectAuthLoading     = (s) => s.auth.loading
export const selectAuthError       = (s) => s.auth.error
export default authSlice.reducer
