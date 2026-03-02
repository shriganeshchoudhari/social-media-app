import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart, MessageCircle, UserPlus, UserCheck,
  AtSign, Share2, Bell, Trash2, X,
} from 'lucide-react'
import {
  fetchNotifications,
  markAllReadThunk,
  markReadThunk,
  deleteNotificationThunk,
  clearAllThunk,
  fetchUnreadCount,
  setActiveFilter,
  selectNotifications,
  selectNotifLoading,
  selectUnreadCount,
  selectTotalPages,
  selectCurrentPage,
  selectActiveFilter,
} from '../store/notificationsSlice.js'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// ── Icon / colour config for all 8 notification types ────────

const TYPE_CONFIG = {
  LIKE:            { Icon: Heart,          color: 'text-pink-500',   bg: 'bg-pink-50'   },
  COMMENT:         { Icon: MessageCircle,  color: 'text-blue-500',   bg: 'bg-blue-50'   },
  REPLY:           { Icon: MessageCircle,  color: 'text-indigo-500', bg: 'bg-indigo-50' },
  FOLLOW:          { Icon: UserPlus,       color: 'text-green-500',  bg: 'bg-green-50'  },
  FOLLOW_REQUEST:  { Icon: UserPlus,       color: 'text-orange-500', bg: 'bg-orange-50' },
  FOLLOW_ACCEPTED: { Icon: UserCheck,      color: 'text-teal-500',   bg: 'bg-teal-50'   },
  MENTION:         { Icon: AtSign,         color: 'text-purple-500', bg: 'bg-purple-50' },
  SHARE:           { Icon: Share2,         color: 'text-cyan-500',   bg: 'bg-cyan-50'   },
}

const relativeTime = (iso) => {
  const d = (Date.now() - new Date(iso)) / 1000
  if (d < 60)    return 'just now'
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}

// ── Individual notification row ───────────────────────────────

function NotificationRow({ notification: n, onNavigate, onDelete }) {
  const cfg  = TYPE_CONFIG[n.type] || { Icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' }
  const Icon = cfg.Icon
  const linkTo = n.referenceId
    ? `/posts/${n.referenceId}`
    : n.actorUsername
      ? `/profile/${n.actorUsername}`
      : null

  const inner = (
    <div
      data-testid="notification-item"
      data-unread={!n.read}
      className={`
        group flex items-start gap-3 px-4 py-3 transition-colors
        hover:bg-gray-50 dark:hover:bg-gray-800/50 relative
        ${!n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''}
      `}
    >
      {/* Type icon */}
      <div className={`shrink-0 mt-1 p-2 rounded-full ${cfg.bg}`}>
        <Icon size={16} className={cfg.color} />
      </div>

      {/* Avatar */}
      {n.actorUsername && (
        <Avatar
          src={n.actorAvatarUrl}
          name={n.actorUsername}
          size="sm"
          className="shrink-0 mt-0.5"
        />
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">{n.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{relativeTime(n.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <span
          data-testid="unread-dot"
          className="mt-2 w-2 h-2 rounded-full bg-primary-500 shrink-0"
        />
      )}

      {/* Delete button — revealed on hover */}
      <button
        data-testid="delete-notification-btn"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(n.id) }}
        className="
          shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity
          text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400
          focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded
        "
        aria-label="Delete notification"
      >
        <X size={15} />
      </button>
    </div>
  )

  const handleClick = () => onNavigate(n)

  return linkTo ? (
    <Link to={linkTo} onClick={handleClick} className="block border-b border-gray-50 dark:border-gray-800/50 last:border-0">
      {inner}
    </Link>
  ) : (
    <div onClick={handleClick} className="block border-b border-gray-50 dark:border-gray-800/50 last:border-0 cursor-pointer">
      {inner}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────

export default function NotificationsPage() {
  const dispatch     = useDispatch()
  const navigate     = useNavigate()
  const items        = useSelector(selectNotifications)
  const loading      = useSelector(selectNotifLoading)
  const unreadCount  = useSelector(selectUnreadCount)
  const totalPages   = useSelector(selectTotalPages)
  const currentPage  = useSelector(selectCurrentPage)
  const activeFilter = useSelector(selectActiveFilter)

  // Track whether a clear-all confirmation is pending
  const confirmingClear = useRef(false)

  // Fetch on mount and whenever the filter changes
  useEffect(() => {
    dispatch(fetchNotifications({ page: 0, unreadOnly: activeFilter === 'unread' }))
    dispatch(fetchUnreadCount())
  }, [dispatch, activeFilter])

  const switchFilter = (filter) => {
    if (filter === activeFilter) return
    dispatch(setActiveFilter(filter))
  }

  const handleMarkAll = () => dispatch(markAllReadThunk())

  const handleDelete = (id) => dispatch(deleteNotificationThunk(id))

  const handleClearAll = () => {
    if (!confirmingClear.current) {
      confirmingClear.current = true
      // Reset confirm flag after 3 s if user doesn't click again
      setTimeout(() => { confirmingClear.current = false }, 3000)
      return
    }
    confirmingClear.current = false
    dispatch(clearAllThunk())
  }

  const handleLoadMore = () => {
    dispatch(fetchNotifications({
      page: currentPage + 1,
      unreadOnly: activeFilter === 'unread',
    }))
  }

  const handleNavigate = (n) => {
    if (!n.read) dispatch(markReadThunk(n.id))
  }

  const hasMore     = currentPage + 1 < totalPages
  const hasUnread   = items.some(n => !n.read)
  const hasItems    = items.length > 0

  return (
    <div className="bg-white dark:bg-gray-900 sm:rounded-xl sm:border sm:border-gray-200 dark:sm:border-gray-800 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1
            data-testid="notifications-header"
            className="text-lg font-bold text-gray-900 dark:text-gray-100"
          >
            Notifications
          </h1>

          <div className="flex items-center gap-1">
            {hasUnread && (
              <Button variant="ghost" size="sm" onClick={handleMarkAll}>
                Mark all read
              </Button>
            )}
            {hasItems && (
              <Button
                variant="ghost"
                size="sm"
                data-testid="clear-all-btn"
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash2 size={14} className="inline mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* ── Filter tabs ─────────────────────────────────────── */}
        <div className="flex border-t border-gray-100 dark:border-gray-800">
          <button
            data-testid="filter-tab-all"
            onClick={() => switchFilter('all')}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${activeFilter === 'all'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            All
          </button>
          <button
            data-testid="filter-tab-unread"
            onClick={() => switchFilter('unread')}
            className={`flex-1 py-2 text-sm font-medium transition-colors
              ${activeFilter === 'unread'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-[10px] font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center px-4">
          <span className="text-5xl">{activeFilter === 'unread' ? '✅' : '🔔'}</span>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {activeFilter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeFilter === 'unread'
              ? 'You have no unread notifications.'
              : 'When someone likes, comments, or follows you, it\'ll show up here.'}
          </p>
        </div>
      ) : (
        <div>
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onNavigate={handleNavigate}
              onDelete={handleDelete}
            />
          ))}

          {/* ── Load more ──────────────────────────────────── */}
          {hasMore && (
            <div className="flex justify-center p-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                data-testid="load-more-btn"
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                loading={loading}
                disabled={loading}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
