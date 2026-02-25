import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { selectIsAuthenticated } from '../store/authSlice.js'
import {
  receiveWsMessage,
  setTyping,
} from '../store/messagingSlice.js'
import { addNotification } from '../store/notificationsSlice.js'

const WS_URL = '/ws'

/**
 * Manages the application-wide STOMP/WebSocket connection.
 * Call this hook ONCE at the top of AppLayout.
 *
 * Returns { sendMessage, sendTyping } for use in chat components.
 */
export default function useWebSocket() {
  const dispatch    = useDispatch()
  const isAuth      = useSelector(selectIsAuthenticated)
  const clientRef   = useRef(null)
  const subs        = useRef({})   // active subscriptions keyed by destination

  // ── Connect/disconnect on auth change ──────────────────────
  useEffect(() => {
    if (!isAuth) {
      clientRef.current?.deactivate()
      clientRef.current = null
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.debug('[WS] Connected')

        // Subscribe to personal notification queue
        stompClient.subscribe('/user/queue/notifications', (frame) => {
          try {
            const notification = JSON.parse(frame.body)
            dispatch(addNotification(notification))
          } catch {/* ignore malformed frames */}
        })
      },
      onDisconnect: () => console.debug('[WS] Disconnected'),
      onStompError: (frame) => console.error('[WS] STOMP error', frame),
    })

    stompClient.activate()
    clientRef.current = stompClient

    return () => {
      stompClient.deactivate()
      clientRef.current = null
    }
  }, [isAuth, dispatch])

  // ── Subscribe to a conversation ────────────────────────────
  const subscribeToConversation = useCallback((conversationId) => {
    const dest = `/topic/chat/${conversationId}`
    if (subs.current[dest]) return // already subscribed

    const client = clientRef.current
    if (!client?.connected) return

    const sub = client.subscribe(dest, (frame) => {
      try {
        const message = JSON.parse(frame.body)
        dispatch(receiveWsMessage(message))
      } catch {/* ignore */}
    })
    subs.current[dest] = sub

    // Also subscribe to typing indicator
    const typingDest = `/topic/typing/${conversationId}`
    if (!subs.current[typingDest]) {
      const typingSub = client.subscribe(typingDest, (frame) => {
        try {
          const { username, isTyping } = JSON.parse(frame.body)
          dispatch(setTyping({ conversationId, username, isTyping }))
        } catch {/* ignore */}
      })
      subs.current[typingDest] = typingSub
    }
  }, [dispatch])

  const unsubscribeFromConversation = useCallback((conversationId) => {
    const dest = `/topic/chat/${conversationId}`
    subs.current[dest]?.unsubscribe()
    delete subs.current[dest]
    const typingDest = `/topic/typing/${conversationId}`
    subs.current[typingDest]?.unsubscribe()
    delete subs.current[typingDest]
  }, [])

  // ── Send helpers ───────────────────────────────────────────
  const sendWsMessage = useCallback((conversationId, content) => {
    clientRef.current?.publish({
      destination: '/app/send-message',
      body: JSON.stringify({ conversationId, content }),
    })
  }, [])

  const sendTyping = useCallback((conversationId, isTyping) => {
    clientRef.current?.publish({
      destination: '/app/typing',
      body: JSON.stringify({ conversationId, isTyping }),
    })
  }, [])

  return { sendWsMessage, sendTyping, subscribeToConversation, unsubscribeFromConversation }
}
