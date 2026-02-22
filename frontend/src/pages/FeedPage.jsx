import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFeed, selectFeed, selectFeedLoading,
  selectLoadingMore, selectTotalPages, selectCurrentPage,
} from '../store/postsSlice.js'
import PostCard from '../components/post/PostCard.jsx'
import PostComposer from '../components/post/PostComposer.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function FeedPage() {
  const dispatch     = useDispatch()
  const posts        = useSelector(selectFeed)
  const loading      = useSelector(selectFeedLoading)
  const loadingMore  = useSelector(selectLoadingMore)
  const totalPages   = useSelector(selectTotalPages)
  const currentPage  = useSelector(selectCurrentPage)

  useEffect(() => { dispatch(fetchFeed(0)) }, [dispatch])

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
    if (nearBottom && !loadingMore && currentPage + 1 < totalPages) {
      dispatch(fetchFeed(currentPage + 1))
    }
  }, [dispatch, loadingMore, currentPage, totalPages])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Home</h1>
      </div>

      {/* Composer */}
      <PostComposer />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center px-4">
          <span className="text-5xl">👋</span>
          <p className="text-lg font-semibold text-gray-800">Your feed is empty</p>
          <p className="text-sm text-gray-500">Follow people to see their posts here, or share your first post above!</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          {loadingMore && (
            <div className="flex justify-center py-6"><Spinner /></div>
          )}
          {!loadingMore && currentPage + 1 >= totalPages && posts.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-6">You're all caught up!</p>
          )}
        </>
      )}
    </div>
  )
}
