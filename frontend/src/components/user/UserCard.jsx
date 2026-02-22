import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../../store/authSlice.js'
import { followUser, unfollowUser } from '../../api/users.js'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'

export default function UserCard({ user: initial }) {
  const me = useSelector(selectUser)
  const [user, setUser]       = useState(initial)
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState(false)

  if (!user) return null
  const isMe = me?.username === user.username

  const toggle = async () => {
    setLoading(true)
    try {
      if (following) {
        await unfollowUser(user.username)
        setFollowing(false)
        setUser(u => ({ ...u, followersCount: Math.max(0, u.followersCount - 1) }))
      } else {
        await followUser(user.username)
        setFollowing(true)
        setUser(u => ({ ...u, followersCount: u.followersCount + 1 }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <Link to={`/profile/${user.username}`}>
        <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.username}`} className="block">
          <p className="text-sm font-semibold text-gray-900 truncate hover:underline">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        </Link>
        {user.bio && <p className="text-xs text-gray-600 mt-0.5 truncate">{user.bio}</p>}
      </div>
      {!isMe && (
        <Button
          variant={following ? 'secondary' : 'primary'}
          size="sm"
          onClick={toggle}
          loading={loading}
        >
          {following ? 'Unfollow' : 'Follow'}
        </Button>
      )}
    </div>
  )
}
