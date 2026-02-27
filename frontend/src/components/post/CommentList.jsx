import { useEffect, useState, useCallback } from 'react'
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

/** Renders comment text with clickable @mentions and #hashtags */
function CommentContent({ content }) {
  const parts = content.split(/([@#]\w+)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^@\w+$/.test(part)) {
          return (
            <a key={i} href={`/profile/${part.slice(1)}`}
               className="text-primary-500 hover:underline font-medium"
               onClick={e => e.stopPropagation()}>
              {part}
            </a>
          )
        }
        if (/^#\w+$/.test(part)) {
          return (
            <a key={i} href={`/hashtag/${part.slice(1).toLowerCase()}`}
               className="text-primary-500 hover:underline font-medium"
               onClick={e => e.stopPropagation()}>
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function CommentList({ postId }) {
  const me = useSelector(selectUser)
  const [comments, setComments]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [text, setText]               = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [deletingIds, setDeletingIds] = useState(new Set())
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(1)

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    try {
      const { data } = await getComments(postId, p)
      setComments(prev => p === 0 ? data.content : [...prev, ...data.content])
      setTotalPages(data.totalPages)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => { load(0) }, [load])

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

  /** Optimistic deletion — removes immediately, restores on API error */
  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete comment?')) return

    // 1. Optimistically remove from UI
    setComments(prev => prev.filter(c => c.id !== commentId))
    setDeletingIds(prev => new Set(prev).add(commentId))

    try {
      await deleteComment(postId, commentId)
    } catch {
      // 2. Restore on failure by reloading the page
      load(0)
    } finally {
      setDeletingIds(prev => { const s = new Set(prev); s.delete(commentId); return s })
    }
  }

  return (
    <div>
      {/* Input */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <Avatar src={me?.avatarUrl} name={me?.displayName || me?.username} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Add a comment…"
            aria-label="Write a comment"
            className="flex-1 text-sm outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-full px-4 py-2 focus:border-primary-300 dark:focus:border-primary-700 transition-colors"
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
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">No comments yet. Be the first!</p>
      ) : (
        <div>
          {comments.map(c => (
            <div
              key={c.id}
              className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors
                ${deletingIds.has(c.id) ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <Avatar src={c.author.avatarUrl} name={c.author.displayName || c.author.username} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`/profile/${c.author.username}`}
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:underline"
                  >
                    {c.author.displayName || c.author.username}
                  </a>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{relativeTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">
                  <CommentContent content={c.content} />
                </p>
              </div>
              {me?.username === c.author.username && (
                <button
                  onClick={() => handleDelete(c.id)}
                  aria-label="Delete comment"
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors self-start mt-1 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950"
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
