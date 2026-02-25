/**
 * AiChatButton — the floating ⚡ button that opens/closes the Spark AI panel.
 *
 * - Fixed position: bottom-right corner, above mobile nav bar.
 * - Registers Ctrl/Cmd + K keyboard shortcut globally.
 * - Shows a pulsing badge while streaming (response in progress).
 * - Accessible: keyboard-focusable, role="button", aria-label.
 */

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  toggleAiPanel,
  selectAiOpen,
  selectAiStreaming,
} from '../../store/aiSlice.js'

export default function AiChatButton() {
  const dispatch    = useDispatch()
  const isOpen      = useSelector(selectAiOpen)
  const isStreaming = useSelector(selectAiStreaming)

  // Register Ctrl/Cmd + K globally
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        dispatch(toggleAiPanel())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  return (
    <button
      onClick={() => dispatch(toggleAiPanel())}
      aria-label={isOpen ? 'Close Spark AI assistant' : 'Open Spark AI assistant'}
      data-testid="ai-chat-button"
      title="Ask Spark (Ctrl+K)"
      className={`
        fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50
        flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg
        font-medium text-sm transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
        ${isOpen
          ? 'bg-purple-700 text-white hover:bg-purple-800'
          : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-xl hover:-translate-y-0.5'
        }
      `}
    >
      {/* Spark icon */}
      <span className="text-base leading-none" aria-hidden>⚡</span>

      <span>Ask Spark</span>

      {/* Streaming pulse badge */}
      {isStreaming && (
        <span
          className="w-2 h-2 rounded-full bg-green-300 animate-pulse"
          aria-label="AI is responding"
          data-testid="streaming-badge"
        />
      )}
    </button>
  )
}
