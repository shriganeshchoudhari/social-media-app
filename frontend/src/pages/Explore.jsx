import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplore, fetchTrending } from '../redux/postSlice';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';

const TABS = [
  { key: 'explore', label: '🌐 Latest', description: 'Most recent public posts' },
  { key: 'trending', label: '🔥 Trending', description: 'Posts with most engagement' },
];

const Explore = () => {
  const dispatch = useDispatch();
  const { explore, trending, exploreLoading, trendingLoading, exploreHasMore, trendingHasMore } = useSelector(
    (state) => state.posts
  );
  const [activeTab, setActiveTab] = useState('explore');
  const [explorePage, setExplorePage] = useState(0);
  const [trendingPage, setTrendingPage] = useState(0);

  useEffect(() => {
    dispatch(fetchExplore(0));
    setExplorePage(0);
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'trending' && trending.length === 0) {
      dispatch(fetchTrending(0));
      setTrendingPage(0);
    }
  };

  const handleLoadMore = () => {
    if (activeTab === 'explore') {
      const next = explorePage + 1;
      setExplorePage(next);
      dispatch(fetchExplore(next));
    } else {
      const next = trendingPage + 1;
      setTrendingPage(next);
      dispatch(fetchTrending(next));
    }
  };

  const posts = activeTab === 'explore' ? explore : trending;
  const isLoading = activeTab === 'explore' ? exploreLoading : trendingLoading;
  const hasMore = activeTab === 'explore' ? exploreHasMore : trendingHasMore;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
          <p className="text-gray-500 text-sm mt-1">Discover content from the whole community</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 shadow-card p-1 mb-5 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {isLoading && posts.length === 0 ? (
          <Loading message="Loading posts..." />
        ) : posts.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">🌐</div>
            <p className="text-gray-500">No posts to show yet</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {isLoading && <Loading />}

            {hasMore && !isLoading && (
              <button onClick={handleLoadMore} className="btn btn-outline w-full mb-4">
                Load more
              </button>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                You've seen everything! 🎉
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
