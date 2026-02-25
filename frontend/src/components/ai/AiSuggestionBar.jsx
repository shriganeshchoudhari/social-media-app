/**
 * AiSuggestionBar — quick-prompt chips shown when conversation is empty.
 *
 * Clicking a chip dispatches sendChatMessage with the appropriate context.
 */

import { useDispatch } from 'react-redux'
import { sendChatMessage } from '../../store/aiSlice.js'

const CHIPS = [
  {
    icon: '📊',
    label: 'Summarise my feed',
    message: "What's happening in my feed today?",
    context: 'feed_summary',
    testId: 'chip-feed-summary',
  },
  {
    icon: '👥',
    label: 'Who should I follow?',
    message: 'Who should I follow based on my interests and network?',
    context: 'general',
    testId: 'chip-follow-recs',
  },
  {
    icon: '💡',
    label: 'Post ideas',
    message: 'Give me some creative post ideas based on my profile and interests.',
    context: 'general',
    testId: 'chip-post-ideas',
  },
  {
    icon: '❓',
    label: 'What can you do?',
    message: 'What can you help me with on ConnectHub?',
    context: 'general',
    testId: 'chip-help',
  },
]

export default function AiSuggestionBar() {
  const dispatch = useDispatch()

  const handleChip = (chip) => {
    dispatch(sendChatMessage(chip.message, chip.context))
  }

  return (
    <div className="flex flex-col gap-2 px-1 py-2" data-testid="suggestion-bar">
      <p className="text-xs text-gray-400 text-center mb-1">Try asking…</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {CHIPS.map((chip) => (
          <button
            key={chip.testId}
            onClick={() => handleChip(chip)}
            data-testid={chip.testId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs text-gray-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-colors shadow-sm"
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
