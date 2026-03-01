import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ConversationList from '../components/messaging/ConversationList.jsx'
import ChatWindow from '../components/messaging/ChatWindow.jsx'
import useWebSocket from '../hooks/useWebSocket.js'
import { sendMessageThunk, selectActiveConversationId, selectConversations, setActiveConversation } from '../store/messagingSlice.js'
import * as searchApi from '../api/search.js'

export default function MessagesPage() {
  const dispatch        = useDispatch()
  const activeId        = useSelector(selectActiveConversationId)
  const conversations   = useSelector(selectConversations)
  const activeConv      = conversations.find(c => c.id === activeId) ?? null

  const { sendWsMessage, sendTyping, subscribeToConversation, unsubscribeFromConversation } = useWebSocket()

  // Subscribe/unsubscribe from the active conversation's WS topic
  const prevActiveId = useRef(null)
  useEffect(() => {
    if (prevActiveId.current && prevActiveId.current !== activeId) {
      unsubscribeFromConversation(prevActiveId.current)
    }
    if (activeId) {
      subscribeToConversation(activeId)
    }
    prevActiveId.current = activeId
  }, [activeId, subscribeToConversation, unsubscribeFromConversation])

  // ── New conversation search ─────────────────────────────────
  const [showSearch, setShowSearch]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setResults]   = useState([])
  const searchTimer                   = useRef(null)

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    clearTimeout(searchTimer.current)
    if (!q.trim()) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await searchApi.searchUsers(q, 0)
        setResults(data.content ?? [])
      } catch { setResults([]) }
    }, 300)
  }

  const startConversation = (user) => {
    setShowSearch(false)
    setSearchQuery('')
    setResults([])
    dispatch(sendMessageThunk({ recipientId: user.id, content: '👋' }))
      .unwrap()
      .then((msg) => dispatch(setActiveConversation(msg.conversationId)))
      .catch(() => {})
  }

  return (
    <div className="flex h-[calc(100vh-0px)] md:h-[calc(100vh-32px)] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* ── Left panel: conversation list ── */}
      <div className={`flex flex-col border-r border-gray-200 w-full md:w-72 shrink-0
        ${activeId ? 'hidden md:flex' : 'flex'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h1 className="text-base font-bold text-gray-900">Messages</h1>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {showSearch ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {/* New conversation search */}
        {showSearch && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search people…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            {searchResults.length > 0 && (
              <ul className="mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                {searchResults.map(u => (
                  <li key={u.id}>
                    <button
                      onClick={() => startConversation(u)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm"
                    >
                      <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&size=32`}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{u.displayName || u.username}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <ConversationList onSelect={(conv) => dispatch(setActiveConversation(conv.id))} />
      </div>

      {/* ── Right panel: chat window ── */}
      <div className={`flex-1 flex flex-col ${!activeId ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <ChatWindow
            key={activeConv.id}
            conversation={activeConv}
            sendWsMessage={sendWsMessage}
            sendTyping={sendTyping}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-4 opacity-30">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="font-medium text-sm">Select a conversation</p>
            <p className="text-xs mt-1">or press + to start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
