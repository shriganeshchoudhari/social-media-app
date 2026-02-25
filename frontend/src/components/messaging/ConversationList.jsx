import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatDistanceToNow } from '../ui/timeUtils.js'
import {
  fetchConversations,
  setActiveConversation,
  selectConversations,
  selectActiveConversationId,
} from '../../store/messagingSlice.js'
import { selectUser } from '../../store/authSlice.js'
import Avatar from '../ui/Avatar.jsx'
import { MessageCircle } from 'lucide-react'

export default function ConversationList({ onSelect }) {
  const dispatch       = useDispatch()
  const conversations  = useSelector(selectConversations)
  const activeId       = useSelector(selectActiveConversationId)
  const currentUser    = useSelector(selectUser)

  useEffect(() => {
    dispatch(fetchConversations())
  }, [dispatch])

  const handleSelect = (conv) => {
    dispatch(setActiveConversation(conv.id))
    onSelect?.(conv)
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
        <MessageCircle size={40} className="mb-3 opacity-40" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-1">Search for a user and start chatting</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto flex-1">
      {conversations.map((conv) => {
        const isActive  = conv.id === activeId
        const hasUnread = conv.unreadCount > 0
        return (
          <button
            key={conv.id}
            onClick={() => handleSelect(conv)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100
              ${isActive ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''}`}
          >
            <div className="relative shrink-0">
              <Avatar src={conv.otherAvatarUrl} name={conv.otherDisplayName || conv.otherUsername} size="md" />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {conv.otherDisplayName || conv.otherUsername}
                </span>
                {conv.lastMessageAt && (
                  <span className="text-xs text-gray-400 ml-1 shrink-0">
                    {formatDistanceToNow(conv.lastMessageAt)}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {conv.lastMessageSenderUsername === currentUser?.username ? 'You: ' : ''}
                {conv.lastMessageContent || 'No messages yet'}
              </p>
            </div>
            {hasUnread && (
              <span className="shrink-0 bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
