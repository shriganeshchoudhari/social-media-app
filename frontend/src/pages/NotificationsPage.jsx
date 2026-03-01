import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'
import {
  fetchNotifications, markAllReadThunk, fetchUnreadCount,
  selectNotifications, selectNotifLoading,
} from '../store/notificationsSlice.js'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const TYPE_CONFIG = {
  LIKE: { Icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  COMMENT: { Icon: MessageCircle, color: 'text-primary-500', bg: 'bg-primary-50' },
  FOLLOW: { Icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
}

const relativeTime = (iso) => {
  const d = (Date.now() - new Date(iso)) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

export default function NotificationsPage() {
  const dispatch = useDispatch()
  const items = useSelector(selectNotifications)
  const loading = useSelector(selectNotifLoading)

  useEffect(() => {
    dispatch(fetchNotifications(0))
    dispatch(fetchUnreadCount())
  }, [dispatch])

  const handleMarkAll = async () => {
    await dispatch(markAllReadThunk())
  }

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        {items.some(n => !n.read) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAll}>
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center px-4">
          <span className="text-5xl">🔔</span>
          <p className="text-lg font-semibold text-gray-800">No notifications yet</p>
          <p className="text-sm text-gray-500">When someone likes, comments, or follows you, it&apos;ll show up here.</p>
        </div>
      ) : (
        <div>
          {items.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.LIKE
            const Icon = cfg.Icon
            const linkTo = n.referenceId ? `/posts/${n.referenceId}` : n.actorUsername ? `/profile/${n.actorUsername}` : null

            const content = (
              <div className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                {/* Type icon */}
                <div className={`shrink-0 mt-1 p-2 rounded-full ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>

                {/* Avatar */}
                {n.actorUsername && (
                  <Avatar name={n.actorUsername} size="sm" className="shrink-0" />
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{relativeTime(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span className="mt-2 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                )}
              </div>
            )

            return linkTo ? (
              <Link key={n.id} to={linkTo}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
