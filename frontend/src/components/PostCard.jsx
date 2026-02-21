import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, unlikePost, deletePost, updatePostInFeed } from '../redux/postSlice';
import { postService } from '../services/postService';
import { formatRelativeTime, formatCount } from '../utils/formatters';
import Avatar from './Avatar';

const PostCard = ({ post, onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === post.userId;

  const handleLike = () => {
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);
    if (post.isLikedByCurrentUser) {
      dispatch(unlikePost(post.id));
    } else {
      dispatch(likePost(post.id));
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setCommentsLoading(true);
      try {
        const res = await postService.getComments(post.id);
        setComments(res.data || []);
      } catch (e) {
        console.error('Failed to load comments', e);
      } finally {
        setCommentsLoading(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await postService.addComment(post.id, { content: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
      // Update comment count in redux
      dispatch(updatePostInFeed({ ...post, commentsCount: post.commentsCount + 1 }));
    } catch (e) {
      console.error('Failed to add comment', e);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(post.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      dispatch(updatePostInFeed({ ...post, commentsCount: Math.max(0, post.commentsCount - 1) }));
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await dispatch(deletePost(post.id)).unwrap();
      if (onDelete) onDelete(post.id);
    } catch (e) {
      console.error('Failed to delete post', e);
      setDeleting(false);
    }
  };

  return (
    <div className="card mb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.username}`}>
            <Avatar src={post.profilePictureUrl} name={post.displayName || post.username} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link to={`/profile/${post.username}`} className="font-semibold text-gray-900 hover:underline text-sm">
                {post.displayName || post.username}
              </Link>
              {post.isVerified && (
                <span className="text-primary" title="Verified">✓</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Link to={`/profile/${post.username}`} className="hover:underline">
                @{post.username}
              </Link>
              <span>·</span>
              <span title={new Date(post.createdAt).toLocaleString()}>
                {formatRelativeTime(post.createdAt)}
              </span>
              {post.isEdited && <span className="text-gray-400">(edited)</span>}
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDeletePost}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition text-lg p-1 rounded-full hover:bg-red-50"
            title="Delete post"
          >
            {deleting ? '...' : '🗑'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from(post.hashtags).map((tag) => (
              <span key={tag} className="text-primary text-sm cursor-pointer hover:underline">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Images */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`mt-3 grid gap-2 ${post.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {Array.from(post.imageUrls).map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Post media"
                className="rounded-xl w-full object-cover max-h-64"
              />
            ))}
          </div>
        )}
      </div>

      {/* Privacy indicator */}
      {post.privacyLevel && post.privacyLevel !== 'public' && (
        <div className="mb-2 text-xs text-gray-400 flex items-center gap-1">
          <span>🔒</span> {post.privacyLevel}
        </div>
      )}

      <div className="divider mb-3" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${post.isLikedByCurrentUser
              ? 'text-red-500 bg-red-50 hover:bg-red-100'
              : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            }`}
        >
          <span className={`${likeAnimating ? 'animate-like-pop' : ''} text-base`}>
            {post.isLikedByCurrentUser ? '❤️' : '🤍'}
          </span>
          <span>{formatCount(post.likesCount)}</span>
        </button>

        {/* Comment */}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary-50 transition-all"
        >
          <span className="text-base">💬</span>
          <span>{formatCount(post.commentsCount)}</span>
        </button>

        {/* Share count (static display) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-gray-400">
          <span className="text-base">🔄</span>
          <span>{formatCount(post.sharesCount)}</span>
        </div>

        {/* Views */}
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <span>👁</span>
          <span>{formatCount(post.viewsCount)}</span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {/* Add comment */}
          {user && (
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <Avatar src={user.profilePictureUrl} name={user.displayName || user.username} size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="input text-sm py-1.5 flex-1"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !commentText.trim()}
                  className="btn btn-primary btn-sm disabled:opacity-50"
                >
                  {commentSubmitting ? '...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="text-center text-gray-400 text-sm py-2">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-2">No comments yet. Be the first!</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 group">
                  <Link to={`/profile/${comment.username}`}>
                    <Avatar src={comment.profilePictureUrl} name={comment.displayName || comment.username} size="sm" />
                  </Link>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/profile/${comment.username}`} className="font-semibold text-xs text-gray-900 hover:underline">
                          {comment.displayName || comment.username}
                        </Link>
                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      {user?.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
