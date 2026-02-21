import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../redux/postSlice';
import Navbar from '../components/Navbar';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';

const Home = () => {
  const dispatch = useDispatch();
  const { feed, loading, feedHasMore } = useSelector((state) => state.posts);
  const pageRef = useRef(0);
  const sentinelRef = useRef(null);

  // Initial load
  useEffect(() => {
    pageRef.current = 0;
    dispatch(fetchFeed(0));
  }, [dispatch]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && feedHasMore) {
      pageRef.current += 1;
      dispatch(fetchFeed(pageRef.current));
    }
  }, [dispatch, loading, feedHasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
        {/* Main feed */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto">
          <CreatePostForm />

          {loading && feed.length === 0 ? (
            <Loading message="Loading your feed..." />
          ) : feed.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your feed is empty</h3>
              <p className="text-gray-500 text-sm">
                Follow people to see their posts here, or check out{' '}
                <a href="/explore" className="text-primary hover:underline">Explore</a>
              </p>
            </div>
          ) : (
            <>
              {feed.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {loading && <Loading />}

              {!feedHasMore && feed.length > 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  You've seen all posts! 🎉
                </div>
              )}
            </>
          )}
        </main>

        {/* Right sidebar (desktop) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="card sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span>🔥</span>
                <a href="/explore" className="hover:text-primary transition">Browse Explore for trending posts</a>
              </li>
              <li className="flex items-center gap-2">
                <span>🔍</span>
                <a href="/search" className="hover:text-primary transition">Search for users to follow</a>
              </li>
              <li className="flex items-center gap-2">
                <span>#️⃣</span>
                Use hashtags in your posts
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                Click the comment icon to reply
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
