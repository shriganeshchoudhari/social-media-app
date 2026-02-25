import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bookmark } from 'lucide-react'
import {
  fetchBookmarks,
  selectBookmarkPosts,
  selectBookmarkLoading,
} from '../store/bookmarksSlice.js'
import PostCard from '../components/post/PostCard.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import Button from '../components/ui/Button.jsx'

export default function BookmarksPage() {
  const dispatch = useDispatch()
  const posts    = useSelector(selectBookmarkPosts)
  const loading  = useSelector(selectBookmarkLoading)

  useEffect(() => {
    dispatch(fetchBookmarks(0))
  }, [dispatch])

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-2">
        <Bookmark size={18} className="text-primary-500" />
        <h1 className="text-lg font-bold text-gray-900">Saved Posts</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center px-4">
          <Bookmark size={48} className="text-gray-300" />
          <p className="text-lg font-semibold text-gray-800">No saved posts yet</p>
          <p className="text-sm text-gray-500">
            Tap the bookmark icon on any post to save it here for later.
          </p>
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
