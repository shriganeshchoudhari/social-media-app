import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../ui/Toast.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'
import AiChatButton from '../ai/AiChatButton.jsx'
import AiChatPanel from '../ai/AiChatPanel.jsx'
import useWebSocket from '../../hooks/useWebSocket.js'

function WebSocketProvider() {
  useWebSocket()
  return null
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

        {/* ── Spark AI — floating button + slide-over panel ──────────────── */}
        <AiChatButton />
        <AiChatPanel />

        {/* ── App-wide WebSocket connection ─────────────────────────────── */}
        <WebSocketProvider />
      </div>
    </ToastProvider>
  )
}
