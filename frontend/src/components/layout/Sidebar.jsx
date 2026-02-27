import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Search, Bell, User, LogOut, MessageCircle, Bookmark, Sun, Moon, Settings, Shield } from 'lucide-react'
import { logout, selectUser } from '../../store/authSlice.js'
import { selectUnreadCount } from '../../store/notificationsSlice.js'
import { selectTotalUnread as selectMsgUnread } from '../../store/messagingSlice.js'
import { toggleTheme, selectIsDark } from '../../store/themeSlice.js'
import Avatar from '../ui/Avatar.jsx'

const links = [
  { to: '/',              label: 'Home',          Icon: Home },
  { to: '/search',        label: 'Search',        Icon: Search },
  { to: '/messages',      label: 'Messages',      Icon: MessageCircle, badge: 'messages' },
  { to: '/notifications', label: 'Notifications', Icon: Bell,          badge: 'notifs' },
  { to: '/bookmarks',     label: 'Saved',         Icon: Bookmark },
  { to: '/settings',      label: 'Settings',      Icon: Settings },
]

export default function Sidebar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const unread    = useSelector(selectUnreadCount)
  const msgUnread = useSelector(selectMsgUnread)
  const isDark    = useSelector(selectIsDark)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full p-4 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-2xl font-bold text-primary-500 tracking-tight">ConnectHub</span>
      </div>

      {/* Nav links */}
      <nav aria-label="Sidebar navigation" className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, Icon, badge }) => {
          const badgeCount = badge === 'messages' ? msgUnread : badge === 'notifs' ? unread : 0
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative
                ${isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                }`
              }
            >
              <div className="relative">
                <Icon size={20} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              {label}
            </NavLink>
          )
        })}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive
                ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              }`
            }
          >
            <Shield size={20} /> Admin
          </NavLink>
        )}

        {user && (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              }`
            }
          >
            <User size={20} /> Profile
          </NavLink>
        )}
      </nav>

      {/* Dark mode toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>

      {/* User footer */}
      {user && (
        <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.displayName || user.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
