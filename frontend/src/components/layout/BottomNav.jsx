import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Home, Search, Bell, User, MessageCircle } from 'lucide-react'
import { selectUser } from '../../store/authSlice.js'
import { selectUnreadCount } from '../../store/notificationsSlice.js'
import { selectTotalUnread as selectMsgUnread } from '../../store/messagingSlice.js'

export default function BottomNav() {
  const user     = useSelector(selectUser)
  const unread   = useSelector(selectUnreadCount)
  const msgUnread = useSelector(selectMsgUnread)

  const links = [
    { to: '/',              Icon: Home,          label: 'Home' },
    { to: '/search',        Icon: Search,        label: 'Search' },
    { to: '/messages',      Icon: MessageCircle, label: 'DMs',   badge: msgUnread },
    { to: '/notifications', Icon: Bell,          label: 'Alerts', badge: unread },
    { to: user ? `/profile/${user.username}` : '/login', Icon: User, label: 'Profile' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
      {links.map(({ to, Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors
            ${isActive ? 'text-primary-500' : 'text-gray-500'}`
          }
        >
          <div className="relative">
            <Icon size={22} />
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
