import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as prefApi from '../api/notificationPreferences.js'

// ── Async thunks ──────────────────────────────────────────────

export const fetchPreferences = createAsyncThunk(
  'notifPreferences/fetch',
  async () => {
    const { data } = await prefApi.getPreferences()
    return data
  }
)

export const updatePreferenceThunk = createAsyncThunk(
  'notifPreferences/update',
  async ({ type, inApp }) => {
    const { data } = await prefApi.updatePreference(type, inApp)
    return data
  }
)

// ── Slice ─────────────────────────────────────────────────────

const notifPreferencesSlice = createSlice({
  name: 'notifPreferences',
  initialState: {
    /**
     * Map of type → inApp boolean.
     * e.g. { LIKE: true, COMMENT: true, FOLLOW: false, … }
     */
    preferences: {},
    loading:     false,
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(fetchPreferences.rejected,  (state) => { state.loading = false })
      .addCase(fetchPreferences.fulfilled, (state, { payload }) => {
        state.loading = false
        // Payload is an array of { type, inApp }
        state.preferences = Object.fromEntries(payload.map(p => [p.type, p.inApp]))
      })

      // Optimistic update — already applied before the request returns
      .addCase(updatePreferenceThunk.pending, (state, { meta }) => {
        const { type, inApp } = meta.arg
        state.preferences[type] = inApp
      })
      .addCase(updatePreferenceThunk.rejected, (state, { meta }) => {
        // Rollback on failure: flip it back
        const { type, inApp } = meta.arg
        state.preferences[type] = !inApp
        state.error = 'Failed to save preference'
      })
      .addCase(updatePreferenceThunk.fulfilled, (state, { payload }) => {
        state.preferences[payload.type] = payload.inApp
      })
  },
})

// ── Selectors ─────────────────────────────────────────────────
export const selectPreferences    = (s) => s.notifPreferences.preferences
export const selectPrefsLoading   = (s) => s.notifPreferences.loading

export default notifPreferencesSlice.reducer
