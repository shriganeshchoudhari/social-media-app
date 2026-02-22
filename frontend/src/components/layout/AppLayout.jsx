import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../ui/Toast.jsx'
import Sidebar from './Sidebar.jsx'
import BottomNav from './BottomNav.jsx'

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* Left sidebar — hidden on mobile */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-full border-r border-gray-200 bg-white z-30">
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
      </div>
    </ToastProvider>
  )
}
