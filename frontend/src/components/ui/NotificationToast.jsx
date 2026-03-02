import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { X, Heart, MessageCircle, UserPlus, UserCheck, AtSign, Share2, Bell } from 'lucide-react'
import { markReadThunk } from '../../store/notificationsSlice.js'
import Avatar from './Avatar.jsx'

// ── Icon + colour config ──────────────────────────────────────

const TYPE_CONFIG = {
  LIKE:            { Icon: Heart,          color: 'text-pink-500',   bg: 'bg-pink-100'   },
  COMMENT:         { Icon: MessageCircle,  color: 'text-blue-500',   bg: 'bg-blue-100'   },
  REPLY:           { Icon: MessageCircle,  color: 'text-indigo-500', bg: 'bg-indigo-100' },
  FOLLOW:          { Icon: UserPlus,       color: 'text-green-500',  bg: 'bg-green-100'  },
  FOLLOW_REQUEST:  { Icon: UserPlus,       color: 'text-orange-500', bg: 'bg-orange-100' },
  FOLLOW_ACCEPTED: { Icon: UserCheck,      color: 'text-teal-500',   bg: 'bg-teal-100'   },
  MENTION:         { Icon: AtSign,         color: 'text-purple-500', bg: 'bg-purple-100' },
  SHARE:           { Icon: Share2,         color: 'text-cyan-500',   bg: 'bg-cyan-100'   },
}

// ── Single toast ──────────────────────────────────────────────

function NotificationToastItem({ notification, onDismiss }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [exiting, setExiting] = useState(false)

  const cfg  = TYPE_CONFIG[notification.type] || { Icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' }
  const Icon = cfg.Icon

  const dismiss = () => {
    setExiting(true)
    setTimeout(onDismiss, 300)
  }

  const handleClick = () => {
    if (!notification.read) dispatch(markReadThunk(notification.id))
    const dest = notification.referenceId
      ? `/posts/${notification.referenceId}`
      : notification.actorUsername
        ? `/profile/${notification.actorUsername}`
        : null
    dismiss()
    if (dest) navigate(dest)
  }

  return (
    <div
      data-testid="notification-toast"
      onClick={handleClick}
      className={`
        flex items-start gap-3 w-80 bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700 rounded-xl
        shadow-lg p-3 cursor-pointer
        transition-all duration-300
        ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
        hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700
      `}
    >
      {/* Type icon */}
      <div className={`shrink-0 mt-0.5 p-2 rounded-full ${cfg.bg}`}>
        <Icon size={14} className={cfg.color} />
      </div>

      {/* Avatar */}
      {notification.actorUsername && (
        <Avatar
          src={notification.actorAvatarUrl}
          name={notification.actorUsername}
          size="sm"
          className="shrink-0"
        />
      )}

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">just now</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        className="shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Container (manages a queue from the Redux addNotification action) ──

/**
 * Renders incoming real-time notifications as stacked toasts in the bottom-right corner.
 * Receives toasts via the `incomingNotifications` prop (managed by AppLayout via a ref/queue).
 *
 * Usage: mount once in AppLayout; receives new notifications through the `notifications` prop.
 */
export default function NotificationToastContainer({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null

  return (
    <div
      data-testid="notification-toast-container"
      className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <NotificationToastItem
            notification={n}
            onDismiss={() => onDismiss(n.id)}
          />
        </div>
      ))}
    </div>
  )
}
