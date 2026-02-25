import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from './store/authSlice.js'
import AppLayout from './components/layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import FeedPage from './pages/FeedPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import BookmarksPage from './pages/BookmarksPage.jsx'

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest-only routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Authenticated routes wrapped in sidebar layout */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<FeedPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
