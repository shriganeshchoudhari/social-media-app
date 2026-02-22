import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Search, Bell, User, LogOut } from 'lucide-react'
import { logout, selectUser } from '../../store/authSlice.js'
import { selectUnreadCount } from '../../store/notificationsSlice.js'
import Avatar from '../ui/Avatar.jsx'

const links = [
  { to: '/',             label: 'Home',          Icon: Home },
  { to: '/search',       label: 'Search',         Icon: Search },
  { to: '/notifications',label: 'Notifications',  Icon: Bell },
]

export default function Sidebar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const unread    = useSelector(selectUnreadCount)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-2xl font-bold text-primary-500 tracking-tight">ConnectHub</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative
              ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <div className="relative">
              <Icon size={20} />
              {label === 'Notifications' && unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}

        {user && (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <User size={20} /> Profile
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || user.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
