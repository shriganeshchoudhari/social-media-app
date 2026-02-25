import { useSelector } from 'react-redux'
import { selectUser } from '../../store/authSlice.js'
import { formatTime } from '../ui/timeUtils.js'

export default function MessageBubble({ message }) {
  const me     = useSelector(selectUser)
  const isMine = message.senderId === me?.id

  return (
    <div className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words
          ${isMine
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
      >
        <p>{message.content}</p>
        <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
          {formatTime(message.createdAt)}
          {isMine && (
            <span className="ml-1">{message.read ? '✓✓' : '✓'}</span>
          )}
        </p>
      </div>
    </div>
  )
}
