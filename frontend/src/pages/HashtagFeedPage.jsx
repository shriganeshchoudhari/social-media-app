import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Hash } from 'lucide-react'
import { searchHashtags } from '../api/search.js'
import PostCard from '../components/post/PostCard.jsx'
import { FeedSkeleton } from '../components/ui/PostSkeleton.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function HashtagFeedPage() {
  const { tag } = useParams()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLM] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async (p = 0) => {
    if (p === 0) setLoading(true)
    else setLM(true)
    try {
      const { data } = await searchHashtags(tag, p)
      setPosts(prev => p === 0 ? data.content : [...prev, ...data.content])
      setTotalPages(data.totalPages)
      setPage(p)
    } finally {
      setLoading(false)
      setLM(false)
    }
  }, [tag])

  useEffect(() => {
    setPosts([])
    setPage(0)
    load(0)
  }, [tag, load])

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
      if (nearBottom && !loadingMore && page + 1 < totalPages) load(page + 1)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [loadingMore, page, totalPages, load])

  return (
    <div className="bg-white dark:bg-gray-900 sm:rounded-xl sm:border sm:border-gray-200 dark:sm:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Hash size={18} className="text-primary-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">#{tag}</h1>
            {!loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {posts.length > 0 ? `${posts.length}${page + 1 < totalPages ? '+' : ''} posts` : 'No posts yet'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <FeedSkeleton count={5} />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Hash size={32} className="text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">No posts for #{tag}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to post with this hashtag!</p>
        </div>
      ) : (
        <>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
          {loadingMore && (
            <div className="flex justify-center py-6"><Spinner /></div>
          )}
          {!loadingMore && page + 1 >= totalPages && posts.length > 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">That&apos;s all posts for #{tag}</p>
          )}
        </>
      )}
    </div>
  )
}
