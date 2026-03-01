/**
 * AiChatPanel — the main Spark AI chat UI.
 *
 * Features:
 *  - Slide-over from the right (w-96 on desktop, full-width bottom sheet on mobile)
 *  - Shows AiSuggestionBar when conversation is empty
 *  - Streaming messages via aiSlice thunk
 *  - Graceful degradation: shows retry banner when Ollama is down
 *  - Auto-scrolls to newest message
 *  - Esc key closes the panel
 *  - Character counter and send-button disabled when input is empty or streaming
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeAiPanel,
  clearConversation,
  clearError,
  sendChatMessage,
  setOllamaStatus,
  selectAiOpen,
  selectAiMessages,
  selectAiStreaming,
  selectAiError,
  selectOllamaStatus,
} from '../../store/aiSlice.js'
import { checkAiHealth } from '../../api/aiApi.js'
import AiMessageBubble from './AiMessageBubble.jsx'
import AiSuggestionBar from './AiSuggestionBar.jsx'

const MAX_CHARS = 1000

export default function AiChatPanel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectAiOpen)
  const messages = useSelector(selectAiMessages)
  const isStreaming = useSelector(selectAiStreaming)
  const error = useSelector(selectAiError)
  const ollamaStatus = useSelector(selectOllamaStatus)

  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ── Esc key closes panel ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') dispatch(closeAiPanel()) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, dispatch])

  // ── Auto-focus input when panel opens ──────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ── Auto-scroll to bottom as messages arrive ───────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Ollama health polling: check when panel opens, retry every 10 s if down ─
  const checkHealth = useCallback(async () => {
    const health = await checkAiHealth()
    if (health) {
      dispatch(setOllamaStatus(health.status === 'ok' ? 'ok' : 'degraded'))
    }
  }, [dispatch])

  useEffect(() => {
    if (!isOpen) return
    checkHealth()

    // Poll every 10 s only while Ollama is degraded
    const interval = setInterval(() => {
      if (ollamaStatus !== 'ok') checkHealth()
    }, 10_000)

    return () => clearInterval(interval)
  }, [isOpen, ollamaStatus, checkHealth])

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    dispatch(sendChatMessage(trimmed, 'general'))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const remaining = MAX_CHARS - input.length
  const canSend = input.trim().length > 0 && !isStreaming

  // ── Nothing to render when closed ──────────────────────────────────────────
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 z-40 bg-black/20 md:hidden"
        onClick={() => dispatch(closeAiPanel())}
        data-testid="ai-panel-backdrop"
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Spark AI assistant"
        data-testid="ai-chat-panel"
        className="
          fixed z-50
          bottom-0 left-0 right-0 h-[72vh]
          md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-96
          flex flex-col
          bg-gray-50 border-t border-gray-200
          md:border-t-0 md:border-l md:border-gray-200
          shadow-2xl
          rounded-t-2xl md:rounded-none
        "
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0 rounded-t-2xl md:rounded-none">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>⚡</span>
            <div>
              <p className="font-semibold text-sm text-gray-900">Spark</p>
              <p className="text-xs text-gray-400">ConnectHub AI · powered by Ollama</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Clear conversation */}
            {messages.length > 0 && (
              <button
                onClick={() => dispatch(clearConversation())}
                title="Clear conversation"
                data-testid="clear-conversation-btn"
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
              >
                ↺
              </button>
            )}
            {/* Close */}
            <button
              onClick={() => dispatch(closeAiPanel())}
              aria-label="Close AI panel"
              data-testid="ai-panel-close"
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Ollama health banner ─────────────────────────────────────────── */}
        {ollamaStatus === 'degraded' && (
          <div
            className="flex items-center justify-between gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 shrink-0"
            data-testid="ollama-unavailable-banner"
          >
            <span>⚡ AI assistant is starting up…</span>
            <button
              onClick={checkHealth}
              className="underline hover:no-underline font-medium"
              data-testid="retry-health-btn"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        {error && (
          <div
            className="flex items-center justify-between gap-2 px-4 py-2.5 bg-red-50 border-b border-red-200 text-xs text-red-700 shrink-0"
            data-testid="ai-error-banner"
          >
            <span>{error.message}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="underline hover:no-underline font-medium"
              data-testid="dismiss-error-btn"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Message list ─────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3"
          data-testid="ai-message-list"
        >
          {/* Empty state: show suggestion chips */}
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Hi! I&apos;m Spark</p>
                <p className="text-xs text-gray-400 mt-1">Your ConnectHub AI assistant</p>
              </div>
              <AiSuggestionBar />
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <AiMessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ───────────────────────────────────────────────────── */}
        <div className="px-3 py-3 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-2 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-300 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              placeholder="Ask Spark anything…"
              rows={1}
              disabled={isStreaming}
              data-testid="ai-input"
              aria-label="Message to Spark"
              className="
                flex-1 resize-none text-sm text-gray-800 placeholder-gray-400
                outline-none bg-transparent leading-relaxed max-h-28 overflow-y-auto
                disabled:opacity-60
              "
              style={{ minHeight: '1.5rem' }}
            />
            {/* Char counter (only when close to limit) */}
            {remaining < 200 && (
              <span className={`text-xs shrink-0 self-end mb-0.5 ${remaining < 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {remaining}
              </span>
            )}
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              data-testid="ai-send-btn"
              aria-label="Send message"
              className="
                shrink-0 self-end mb-0.5
                w-7 h-7 rounded-full flex items-center justify-center
                transition-colors text-sm
                disabled:opacity-40 disabled:cursor-not-allowed
                bg-purple-600 text-white hover:bg-purple-700
                disabled:bg-gray-200 disabled:text-gray-400
              "
            >
              {isStreaming ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-300 text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  )
}
