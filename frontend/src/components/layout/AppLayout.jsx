import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../ui/Toast.jsx'
import NotificationToastContainer from '../ui/NotificationToast.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import AiChatButton from '../ai/AiChatButton.jsx'
import AiChatPanel from '../ai/AiChatPanel.jsx'
import useWebSocket from '../../hooks/useWebSocket.js'

const TOAST_TTL_MS  = 4500   // auto-dismiss after 4.5 s
const MAX_TOASTS    = 3      // maximum visible at once

function WebSocketProvider() {
  const [toasts, setToasts] = useState([])

  const handleNewNotification = useCallback((notification) => {
    setToasts(prev => {
      const next = [notification, ...prev].slice(0, MAX_TOASTS)
      return next
    })
    // Auto-dismiss after TTL
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== notification.id))
    }, TOAST_TTL_MS)
  }, [])

  const handleDismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useWebSocket({ onNewNotification: handleNewNotification })

  return (
    <NotificationToastContainer
      notifications={toasts}
      onDismiss={handleDismiss}
    />
  )
}

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
        {/* Left sidebar — hidden on mobile */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-30">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-60 pb-20 md:pb-0">
          <div className="max-w-2xl mx-auto px-0 sm:px-4 py-0 sm:py-4">
            <Outlet />
          </div>
        </main>

        {/* Bottom nav — mobile only */}
        <BottomNav />

        {/* ── Spark AI — floating button + slide-over panel ──────────── */}
        <AiChatButton />
        <AiChatPanel />

        {/* ── App-wide WebSocket + real-time notification toasts ────── */}
        <WebSocketProvider />
      </div>
    </ToastProvider>
  )
}
