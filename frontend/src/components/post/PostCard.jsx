import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Trash2, Globe, Lock, Users, Pencil, Check, X, Bookmark } from 'lucide-react'
import { selectUser } from '../../store/authSlice.js'
import {
  likePostThunk, unlikePostThunk, deletePostThunk, updatePostThunk,
  optimisticLike, optimisticUnlike,
} from '../../store/postsSlice.js'
import { toggleBookmarkThunk, selectIsBookmarked } from '../../store/bookmarksSlice.js'
import Avatar from '../ui/Avatar.jsx'

const privacyIcon = { PUBLIC: Globe, FOLLOWERS_ONLY: Users, PRIVATE: Lock }

const relativeTime = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

/** Renders post content with clickable #hashtags */
function PostContent({ content }) {
  const parts = content.split(/(#\w+)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (/^#\w+$/.test(part)) {
          const tag = part.slice(1).toLowerCase()
          return (
            <Link
              key={i}
              to={`/hashtag/${tag}`}
              className="text-primary-500 hover:text-primary-600 hover:underline font-medium"
              onClick={e => e.stopPropagation()}
            >
              {part}
            </Link>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function PostCard({ post, onDeleted }) {
  const dispatch  = useDispatch()
  const me        = useSelector(selectUser)
  const [liking, setLiking]     = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editText, setEditText] = useState(post.content)
  const [saving, setSaving]     = useState(false)
  const textareaRef             = useRef(null)

  const Privacy     = privacyIcon[post.privacy] || Globe
  const isOwner     = me?.id === post.author?.id || me?.username === post.author?.username
  const isBookmarked = useSelector(selectIsBookmarked(post.id))

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [editing])

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    if (post.likedByCurrentUser) {
      dispatch(optimisticUnlike(post.id))
      await dispatch(unlikePostThunk(post.id))
    } else {
      dispatch(optimisticLike(post.id))
      await dispatch(likePostThunk(post.id))
    }
    setLiking(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    await dispatch(deletePostThunk(post.id))
    onDeleted?.()
  }

  const handleEditStart  = () => { setEditText(post.content); setEditing(true) }
  const handleEditCancel = () => { setEditText(post.content); setEditing(false) }

  const handleEditSave = async () => {
    const trimmed = editText.trim()
    if (!trimmed || trimmed === post.content) { setEditing(false); return }
    setSaving(true)
    await dispatch(updatePostThunk({ id: post.id, content: trimmed, privacy: post.privacy }))
    setSaving(false)
    setEditing(false)
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleEditSave()
    if (e.key === 'Escape') handleEditCancel()
  }

  return (
    <article className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
      {/* Author row */}
      <div className="flex items-start gap-3">
        <Link to={`/profile/${post.author.username}`}>
          <Avatar src={post.author.avatarUrl} name={post.author.displayName || post.author.username} size="md" />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Name + meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${post.author.username}`}
              className="font-semibold text-gray-900 dark:text-gray-100 hover:underline text-sm truncate"
            >
              {post.author.displayName || post.author.username}
            </Link>
            <span className="text-gray-400 dark:text-gray-500 text-xs">@{post.author.username}</span>
            <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
            <span className="text-gray-400 dark:text-gray-500 text-xs">{relativeTime(post.createdAt)}</span>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <span className="text-gray-400 dark:text-gray-500 text-xs italic">(edited)</span>
            )}
            <Privacy size={13} className="text-gray-400 dark:text-gray-500" />
          </div>

          {/* Content — normal or inline editor */}
          {editing ? (
            <div className="mt-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={3}
                maxLength={2000}
                className="w-full text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-primary-300 dark:border-primary-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none leading-relaxed"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-1">{editText.length}/2000 · Ctrl+Enter to save · Esc to cancel</span>
                <button
                  onClick={handleEditSave}
                  disabled={saving || !editText.trim()}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={13} />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={handleEditCancel}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <Link to={`/posts/${post.id}`}>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                <PostContent content={post.content} />
              </p>
            </Link>
          )}

          {/* Image */}
          {post.imageUrl && !editing && (
            <Link to={`/posts/${post.id}`}>
              <img
                src={post.imageUrl}
                alt="Post media"
                className="mt-3 rounded-xl max-h-80 w-full object-cover border border-gray-100 dark:border-gray-800"
                loading="lazy"
              />
            </Link>
          )}

          {/* Actions */}
          {!editing && (
            <div className="flex items-center gap-5 mt-3">
              {/* Like */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors group ${
                  post.likedByCurrentUser ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
                }`}
                aria-label={post.likedByCurrentUser ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={18}
                  className={`transition-transform group-active:scale-125 ${post.likedByCurrentUser ? 'fill-pink-500' : ''}`}
                />
                <span>{post.likesCount}</span>
              </button>

              {/* Comments */}
              <Link
                to={`/posts/${post.id}`}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors"
              >
                <MessageCircle size={18} />
                <span>{post.commentsCount}</span>
              </Link>

              {/* Bookmark */}
              <button
                onClick={() => dispatch(toggleBookmarkThunk(post.id))}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isBookmarked ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-primary-500'
                }`}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                title={isBookmarked ? 'Saved' : 'Save'}
              >
                <Bookmark size={18} className={isBookmarked ? 'fill-primary-500' : ''} />
              </button>

              {/* Owner actions */}
              {isOwner && (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={handleEditStart}
                    className="text-gray-400 dark:text-gray-500 hover:text-primary-500 transition-colors p-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    aria-label="Edit post"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                    aria-label="Delete post"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
