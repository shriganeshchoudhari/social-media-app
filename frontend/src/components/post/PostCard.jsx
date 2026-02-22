import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Trash2, Globe, Lock, Users } from 'lucide-react'
import { selectUser } from '../../store/authSlice.js'
import {
  likePostThunk, unlikePostThunk, deletePostThunk,
  optimisticLike, optimisticUnlike,
} from '../../store/postsSlice.js'
import Avatar from '../ui/Avatar.jsx'

const privacyIcon = { PUBLIC: Globe, FOLLOWERS_ONLY: Users, PRIVATE: Lock }
const relativeTime = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function PostCard({ post, onDeleted }) {
  const dispatch  = useDispatch()
  const me        = useSelector(selectUser)
  const [liking, setLiking] = useState(false)

  const Privacy = privacyIcon[post.privacy] || Globe
  const isOwner = me?.id === post.author?.id || me?.username === post.author?.username

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

  return (
    <article className="bg-white border-b border-gray-200 px-4 py-4 hover:bg-gray-50/50 transition-colors">
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
              className="font-semibold text-gray-900 hover:underline text-sm truncate"
            >
              {post.author.displayName || post.author.username}
            </Link>
            <span className="text-gray-400 text-xs">@{post.author.username}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-gray-400 text-xs">{relativeTime(post.createdAt)}</span>
            <Privacy size={13} className="text-gray-400" />
          </div>

          {/* Content */}
          <Link to={`/posts/${post.id}`}>
            <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </p>
          </Link>

          {/* Image */}
          {post.imageUrl && (
            <Link to={`/posts/${post.id}`}>
              <img
                src={post.imageUrl}
                alt="Post media"
                className="mt-3 rounded-xl max-h-80 w-full object-cover border border-gray-100"
                loading="lazy"
              />
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center gap-5 mt-3">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors group ${
                post.likedByCurrentUser ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
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
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors"
            >
              <MessageCircle size={18} />
              <span>{post.commentsCount}</span>
            </Link>

            {/* Delete (owner only) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Delete post"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
