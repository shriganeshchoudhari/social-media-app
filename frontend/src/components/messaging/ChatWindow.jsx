import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Send, ArrowLeft } from 'lucide-react'
import {
  fetchMessages,
  sendMessageThunk,
  markReadThunk,
  selectMessagesForConv,
  selectTyping,
  setActiveConversation,
} from '../../store/messagingSlice.js'
import { selectUser } from '../../store/authSlice.js'
import Avatar from '../ui/Avatar.jsx'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'

export default function ChatWindow({ conversation, sendWsMessage, sendTyping }) {
  const dispatch   = useDispatch()
  const me         = useSelector(selectUser)
  const msgState   = useSelector(selectMessagesForConv(conversation.id))
  const typing     = useSelector(selectTyping(conversation.id))

  const [text, setText]           = useState('')
  const [typingTimer, setTimer]   = useState(null)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  // Load messages and mark as read on mount / conversation change
  useEffect(() => {
    dispatch(fetchMessages({ conversationId: conversation.id, page: 0 }))
    dispatch(markReadThunk(conversation.id))
    inputRef.current?.focus()
  }, [conversation.id, dispatch])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgState?.items?.length])

  const handleSend = useCallback(() => {
    const content = text.trim()
    if (!content) return
    setText('')

    // Send via WebSocket for real-time delivery
    sendWsMessage(conversation.id, content)
    // Also persist via REST (ensures delivery even if WS drops)
    dispatch(sendMessageThunk({ recipientId: conversation.otherUserId, content }))

    // Stop typing indicator
    sendTyping(conversation.id, false)
  }, [text, conversation.id, conversation.otherUserId, dispatch, sendWsMessage, sendTyping])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e) => {
    setText(e.target.value)

    // Typing indicator: start / debounce stop
    sendTyping(conversation.id, true)
    clearTimeout(typingTimer)
    setTimer(setTimeout(() => sendTyping(conversation.id, false), 2000))
  }

  const messages = msgState?.items ?? []

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          className="md:hidden p-1 text-gray-500 hover:text-gray-700"
          onClick={() => dispatch(setActiveConversation(null))}
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar src={conversation.otherAvatarUrl} name={conversation.otherDisplayName || conversation.otherUsername} size="sm" />
        <div>
          <p className="font-semibold text-sm text-gray-900">
            {conversation.otherDisplayName || conversation.otherUsername}
          </p>
          <p className="text-xs text-gray-400">@{conversation.otherUsername}</p>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">
            Say hi to {conversation.otherDisplayName || conversation.otherUsername}! 👋
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <TypingIndicator username={typing?.username !== me?.username ? typing?.username : null} />
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-2.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
