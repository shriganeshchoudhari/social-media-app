import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';

const TABS = ['Users', 'Posts'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query.trim());
    }
  }, [query]);

  const performSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      const [userRes, postRes] = await Promise.allSettled([
        userService.searchUsers(q),
        postService.getExplore(0, 20),
      ]);

      if (userRes.status === 'fulfilled') {
        setUsers(userRes.value.data?.content || []);
      }

      // Filter posts from explore by content match
      if (postRes.status === 'fulfilled') {
        const allPosts = postRes.value.data?.content || [];
        const filtered = allPosts.filter(
          (p) =>
            p.content?.toLowerCase().includes(q.toLowerCase()) ||
            p.username?.toLowerCase().includes(q.toLowerCase()) ||
            p.hashtags?.some((h) => h.toLowerCase().includes(q.toLowerCase()))
        );
        setPosts(filtered);
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setQuery(q);
    setSearchParams({ q });
  };

  const handleFollowToggle = async (u) => {
    try {
      if (u.isFollowedByCurrentUser) {
        await userService.unfollowUser(u.id);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === u.id
              ? { ...user, isFollowedByCurrentUser: false, followersCount: Math.max(0, user.followersCount - 1) }
              : user
          )
        );
      } else {
        await userService.followUser(u.id);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === u.id
              ? { ...user, isFollowedByCurrentUser: true, followersCount: user.followersCount + 1 }
              : user
          )
        );
      }
    } catch (e) {
      console.error('Follow toggle failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search users, posts, hashtags..."
              className="input pl-10 input-lg"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {/* Results */}
        {!searched ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-2">Search SocialHub</h3>
            <p className="text-gray-500 text-sm">Search for users, posts, or hashtags</p>
          </div>
        ) : loading ? (
          <Loading message="Searching..." />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex bg-white rounded-2xl border border-gray-100 shadow-card p-1 mb-4 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab} {tab === 'Users' ? `(${users.length})` : `(${posts.length})`}
                </button>
              ))}
            </div>

            {/* Users tab */}
            {activeTab === 'Users' && (
              users.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-gray-500">No users found for "{query}"</p>
                </div>
              ) : (
                <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                      <div className="cursor-pointer" onClick={() => navigate(`/profile/${u.username}`)}>
                        <Avatar src={u.profilePictureUrl} name={u.displayName || u.username} size="md" />
                      </div>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/profile/${u.username}`)}
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm text-gray-900 truncate">{u.displayName}</span>
                          {u.isVerified && <span className="text-primary text-xs">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                        {u.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{u.bio}</p>}
                      </div>
                      <button
                        onClick={() => handleFollowToggle(u)}
                        className={`btn btn-sm flex-shrink-0 ${
                          u.isFollowedByCurrentUser ? 'btn-outline' : 'btn-primary'
                        }`}
                      >
                        {u.isFollowedByCurrentUser ? 'Unfollow' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Posts tab */}
            {activeTab === 'Posts' && (
              posts.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-gray-500">No posts found for "{query}"</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
