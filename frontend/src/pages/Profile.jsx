import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/authSlice';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import Loading from '../components/Loading';
import { formatCount, formatRelativeTime } from '../utils/formatters';

const TABS = ['Posts', 'Followers', 'Following'];

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('Posts');
  const [pageLoading, setPageLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [postsPage, setPostsPage] = useState(0);
  const [postsHasMore, setPostsHasMore] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const isOwnProfile = currentUser?.username === (username || currentUser?.username);
  const targetUsername = username || currentUser?.username;

  // Load profile
  useEffect(() => {
    if (!targetUsername) return;
    setPageLoading(true);
    setError('');
    setPosts([]);
    setPostsPage(0);
    setPostsHasMore(true);

    userService.getUserByUsername(targetUsername)
      .then((res) => {
        setProfile(res.data);
        setEditForm({
          displayName: res.data.displayName || '',
          bio: res.data.bio || '',
          location: res.data.location || '',
          website: res.data.website || '',
          profilePictureUrl: res.data.profilePictureUrl || '',
        });
      })
      .catch(() => setError('User not found'))
      .finally(() => setPageLoading(false));
  }, [targetUsername]);

  // Load posts when profile loaded
  const loadPosts = useCallback(async (page = 0) => {
    if (!profile) return;
    setPostsLoading(true);
    try {
      const res = await userService.getUserPosts(profile.id, page);
      const data = res.data;
      if (page === 0) {
        setPosts(data.content);
      } else {
        setPosts((prev) => [...prev, ...data.content]);
      }
      setPostsHasMore(!data.last);
    } catch (e) {
      console.error(e);
    } finally {
      setPostsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && activeTab === 'Posts') {
      loadPosts(0);
    }
    if (profile && activeTab === 'Followers') {
      userService.getFollowers(profile.id).then((res) => setFollowers(res.data || []));
    }
    if (profile && activeTab === 'Following') {
      userService.getFollowing(profile.id).then((res) => setFollowing(res.data || []));
    }
  }, [profile, activeTab, loadPosts]);

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowedByCurrentUser) {
        await userService.unfollowUser(profile.id);
        setProfile((p) => ({
          ...p,
          isFollowedByCurrentUser: false,
          followersCount: Math.max(0, p.followersCount - 1),
        }));
      } else {
        await userService.followUser(profile.id);
        setProfile((p) => ({
          ...p,
          isFollowedByCurrentUser: true,
          followersCount: p.followersCount + 1,
        }));
      }
    } catch (e) {
      console.error('Follow error', e);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setEditLoading(true);
    try {
      const res = await dispatch(updateProfile(editForm)).unwrap();
      setProfile(res);
      setEditing(false);
    } catch (e) {
      console.error('Update error', e);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfile((p) => p ? ({ ...p, postsCount: Math.max(0, p.postsCount - 1) }) : p);
  };

  if (pageLoading) return (
    <div className="min-h-screen bg-surface-50"><Navbar /><Loading message="Loading profile..." /></div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">User not found</h2>
        <p className="text-gray-500 mb-6">The profile @{targetUsername} doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header card */}
        <div className="card mb-4 overflow-hidden p-0">
          {/* Cover */}
          <div
            className="h-36 bg-gradient-to-r from-primary via-primary-600 to-purple-600"
            style={profile?.coverPhotoUrl ? { backgroundImage: `url(${profile.coverPhotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          />

          <div className="px-5 pb-5">
            {/* Avatar row */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="ring-4 ring-white rounded-full">
                <Avatar src={profile?.profilePictureUrl} name={profile?.displayName || profile?.username} size="2xl" />
              </div>

              <div className="flex gap-2 mt-auto">
                {isOwnProfile ? (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn btn-outline btn-sm"
                  >
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`btn btn-sm ${profile?.isFollowedByCurrentUser ? 'btn-outline' : 'btn-primary'} disabled:opacity-50`}
                  >
                    {followLoading ? '...' : profile?.isFollowedByCurrentUser ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Edit form */}
            {editing && isOwnProfile ? (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Name</label>
                  <input
                    className="input text-sm"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
                  <textarea
                    className="input text-sm resize-none"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={500}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                    <input
                      className="input text-sm"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="City, Country"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Website</label>
                    <input
                      className="input text-sm"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      placeholder="https://..."
                      maxLength={200}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Profile Picture URL</label>
                  <input
                    className="input text-sm"
                    value={editForm.profilePictureUrl}
                    onChange={(e) => setEditForm({ ...editForm, profilePictureUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <>
                {/* Display name + verified */}
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-bold text-gray-900">{profile?.displayName}</h1>
                  {profile?.isVerified && <span className="text-primary text-lg" title="Verified">✓</span>}
                </div>
                <p className="text-gray-500 text-sm mb-3">@{profile?.username}</p>

                {profile?.bio && <p className="text-gray-700 text-sm mb-3 leading-relaxed">{profile.bio}</p>}

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  {profile?.location && <span className="flex items-center gap-1"><span>📍</span>{profile.location}</span>}
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <span>🔗</span>{profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {profile?.createdAt && (
                    <span className="flex items-center gap-1">
                      <span>📅</span> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-5 text-sm">
                  <button onClick={() => setActiveTab('Posts')} className="hover:underline">
                    <span className="font-bold text-gray-900">{formatCount(profile?.postsCount)}</span>
                    <span className="text-gray-500 ml-1">Posts</span>
                  </button>
                  <button onClick={() => setActiveTab('Followers')} className="hover:underline">
                    <span className="font-bold text-gray-900">{formatCount(profile?.followersCount)}</span>
                    <span className="text-gray-500 ml-1">Followers</span>
                  </button>
                  <button onClick={() => setActiveTab('Following')} className="hover:underline">
                    <span className="font-bold text-gray-900">{formatCount(profile?.followingCount)}</span>
                    <span className="text-gray-500 ml-1">Following</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'Posts' && (
          <>
            {postsLoading && posts.length === 0 ? (
              <Loading />
            ) : posts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={isOwnProfile ? handlePostDelete : undefined} />
                ))}
                {postsHasMore && (
                  <button
                    onClick={() => {
                      const next = postsPage + 1;
                      setPostsPage(next);
                      loadPosts(next);
                    }}
                    disabled={postsLoading}
                    className="btn btn-outline w-full mb-4"
                  >
                    {postsLoading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'Followers' && (
          <UserList users={followers} emptyMsg="No followers yet" />
        )}

        {activeTab === 'Following' && (
          <UserList users={following} emptyMsg="Not following anyone yet" />
        )}
      </div>
    </div>
  );
};

// Small user list component for followers/following tab
const UserList = ({ users, emptyMsg }) => {
  const navigate = useNavigate();
  if (!users || users.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
      {users.map((u) => (
        <div
          key={u.id}
          onClick={() => navigate(`/profile/${u.username}`)}
          className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition"
        >
          <Avatar src={u.profilePictureUrl} name={u.displayName || u.username} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-gray-900 truncate">{u.displayName}</span>
              {u.isVerified && <span className="text-primary text-xs">✓</span>}
            </div>
            <p className="text-xs text-gray-400">@{u.username}</p>
          </div>
          {u.bio && <p className="text-xs text-gray-500 hidden sm:block max-w-[180px] truncate">{u.bio}</p>}
        </div>
      ))}
    </div>
  );
};

export default Profile;
