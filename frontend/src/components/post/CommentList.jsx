import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Trash2 } from 'lucide-react'
import { getComments, addComment, deleteComment } from '../../api/posts.js'
import { selectUser } from '../../store/authSlice.js'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import Spinner from '../ui/Spinner.jsx'

const relativeTime = (iso) => {
  const d = (Date.now() - new Date(iso)) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m`
  if (d < 86400) return `${Math.floor(d / 3600)}h`
  return `${Math.floor(d / 86400)}d`
}

export default function CommentList({ postId }) {
  const me = useSelector(selectUser)
  const [comments, setComments]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [text, setText]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const load = async (p = 0) => {
    setLoading(true)
    try {
      const { data } = await getComments(postId, p)
      setComments(p === 0 ? data.content : prev => [...prev, ...data.content])
      setTotalPages(data.totalPages)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0) }, [postId])

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const { data } = await addComment(postId, { content: text.trim() })
      setComments(prev => [...prev, data])
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete comment?')) return
    await deleteComment(postId, commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div>
      {/* Input */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-100">
        <Avatar src={me?.avatarUrl} name={me?.displayName || me?.username} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Add a comment…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-gray-50 rounded-full px-4 py-2"
          />
          <Button size="sm" onClick={handleSubmit} loading={submitting} disabled={!text.trim()}>
            Reply
          </Button>
        </div>
      </div>

      {/* List */}
      {loading && page === 0 ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">No comments yet. Be the first!</p>
      ) : (
        <div>
          {comments.map(c => (
            <div key={c.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <Avatar src={c.author.avatarUrl} name={c.author.displayName || c.author.username} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {c.author.displayName || c.author.username}
                  </span>
                  <span className="text-xs text-gray-400">{relativeTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
              </div>
              {(me?.username === c.author.username) && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors self-start mt-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {page < totalPages - 1 && (
            <div className="flex justify-center py-3">
              <Button variant="ghost" size="sm" onClick={() => load(page + 1)} loading={loading}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
