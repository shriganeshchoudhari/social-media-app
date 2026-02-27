// Theme slice — persists dark/light preference to localStorage
import { createSlice } from '@reduxjs/toolkit'

const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
const initial = saved === 'dark' ? 'dark' : 'light'

const apply = (mode) => {
  if (mode === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

// Apply immediately on load (before first render) to avoid flash
apply(initial)

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.mode)
      apply(state.mode)
    },
    setTheme(state, { payload }) {
      state.mode = payload
      localStorage.setItem('theme', payload)
      apply(payload)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export const selectTheme = (s) => s.theme.mode
export const selectIsDark = (s) => s.theme.mode === 'dark'
export default themeSlice.reducer
