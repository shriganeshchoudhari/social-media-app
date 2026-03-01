import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost } from '../api/posts.js'
import PostCard from '../components/post/PostCard.jsx'
import CommentList from '../components/post/CommentList.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { ArrowLeft } from 'lucide-react'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getPost(id)
      .then(({ data }) => setPost(data))
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Post</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center py-16 text-gray-500">{error}</p>
      ) : post ? (
        <>
          <PostCard post={post} onDeleted={() => navigate('/')} />
          <div className="border-t border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700 text-sm">
                {post.commentsCount} {post.commentsCount === 1 ? 'Comment' : 'Comments'}
              </h2>
            </div>
            <CommentList postId={post.id} />
          </div>
        </>
      ) : null}
    </div>
  )
}
