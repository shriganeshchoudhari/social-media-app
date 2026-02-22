import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, updateUser } from '../store/authSlice.js'
import { getUser, getUserPosts, followUser, unfollowUser, isFollowing, updateProfile } from '../api/users.js'
import PostCard from '../components/post/PostCard.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { ArrowLeft, Edit2 } from 'lucide-react'

export default function ProfilePage() {
  const { username } = useParams()
  const navigate     = useNavigate()
  const dispatch     = useDispatch()
  const me           = useSelector(selectUser)

  const [profile, setProfile]         = useState(null)
  const [posts, setPosts]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [following, setFollowing]     = useState(false)
  const [followLoading, setFL]        = useState(false)
  const [postsPage, setPostsPage]     = useState(0)
  const [postsTotal, setPostsTotal]   = useState(1)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editOpen, setEditOpen]       = useState(false)
  const [editForm, setEditForm]       = useState({})
  const [saving, setSaving]           = useState(false)

  const isMe = me?.username === username

  useEffect(() => {
    setLoading(true)
    setPosts([])
    setPostsPage(0)

    Promise.all([
      getUser(username),
      getUserPosts(username, 0),
      !isMe ? isFollowing(username).catch(() => ({ data: { following: false } })) : Promise.resolve({ data: { following: false } }),
    ])
      .then(([{ data: u }, { data: p }, { data: f }]) => {
        setProfile(u)
        setPosts(p.content)
        setPostsTotal(p.totalPages)
        setFollowing(f.following ?? false)
        setEditForm({ displayName: u.displayName || '', bio: u.bio || '', avatarUrl: u.avatarUrl || '' })
      })
      .finally(() => setLoading(false))
  }, [username])

  const loadMorePosts = async () => {
    if (loadingPosts || postsPage + 1 >= postsTotal) return
    setLoadingPosts(true)
    const { data } = await getUserPosts(username, postsPage + 1)
    setPosts(prev => [...prev, ...data.content])
    setPostsPage(p => p + 1)
    setLoadingPosts(false)
  }

  const toggleFollow = async () => {
    setFL(true)
    try {
      if (following) {
        await unfollowUser(username)
        setFollowing(false)
        setProfile(p => ({ ...p, followersCount: Math.max(0, p.followersCount - 1) }))
      } else {
        await followUser(username)
        setFollowing(true)
        setProfile(p => ({ ...p, followersCount: p.followersCount + 1 }))
      }
    } finally { setFL(false) }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await updateProfile(editForm)
      setProfile(data)
      dispatch(updateUser(data))
      setEditOpen(false)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!profile) return <p className="text-center py-16 text-gray-500">User not found</p>

  return (
    <div className="bg-white sm:rounded-xl sm:border sm:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {profile.displayName || profile.username}
          </h1>
          <p className="text-xs text-gray-500">{profile.postsCount} posts</p>
        </div>
      </div>

      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-primary-400 to-primary-600" />

      {/* Avatar + actions */}
      <div className="px-4 pb-4 relative">
        <div className="flex justify-between items-end -mt-10 mb-3">
          <div className="border-4 border-white rounded-full">
            <Avatar src={profile.avatarUrl} name={profile.displayName || profile.username} size="2xl" />
          </div>
          <div className="mt-10">
            {isMe ? (
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                <Edit2 size={14} /> Edit profile
              </Button>
            ) : (
              <Button
                variant={following ? 'secondary' : 'primary'}
                size="sm"
                loading={followLoading}
                onClick={toggleFollow}
              >
                {following ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <h2 className="font-bold text-xl text-gray-900">{profile.displayName || profile.username}</h2>
        <p className="text-sm text-gray-500">@{profile.username}</p>
        {profile.bio && <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>}

        {/* Stats */}
        <div className="flex gap-5 mt-3 text-sm">
          <span><strong className="text-gray-900">{profile.followingCount}</strong> <span className="text-gray-500">Following</span></span>
          <span><strong className="text-gray-900">{profile.followersCount}</strong> <span className="text-gray-500">Followers</span></span>
        </div>
      </div>

      {/* Posts */}
      <div className="border-t border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-700">Posts</h3>
        </div>
        {posts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No posts yet</p>
        ) : (
          <>
            {posts.map(p => <PostCard key={p.id} post={p} />)}
            {postsPage + 1 < postsTotal && (
              <div className="flex justify-center py-4">
                <Button variant="ghost" size="sm" onClick={loadMorePosts} loading={loadingPosts}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Display name"
            value={editForm.displayName}
            onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
            placeholder="Your name"
          />
          <Input
            label="Avatar URL"
            value={editForm.avatarUrl}
            onChange={e => setEditForm(f => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="https://…"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-900">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell the world about yourself"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg outline-none resize-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
