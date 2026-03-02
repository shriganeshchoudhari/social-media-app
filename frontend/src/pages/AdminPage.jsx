import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, Trash2, Crown, UserX, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { selectUser } from '../store/authSlice.js'
import client from '../api/client.js'
import Avatar from '../components/ui/Avatar.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// ── API helpers ─────────────────────────────────────────────
const getStats   = ()              => client.get('/admin/stats')
const listUsers  = (q, page, size) => client.get('/admin/users', { params: { q, page, size } })
const updateRole = (id, role)      => client.put(`/admin/users/${id}/role`, { role })
const deleteUser = (id)            => client.delete(`/admin/users/${id}`)

// ── Stat Card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value ?? '–'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const me       = useSelector(selectUser)
  const navigate = useNavigate()

  const [stats, setStats]           = useState(null)
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [actionId, setActionId]     = useState(null) // userId currently being mutated
  const [q, setQ]                   = useState('')
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast]           = useState(null)

  // Guard — redirect non-admins
  useEffect(() => {
    if (me && me.role !== 'ADMIN') navigate('/', { replace: true })
  }, [me, navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load stats
  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  // Load users
  const loadUsers = useCallback(async (qVal, p) => {
    setLoading(true)
    try {
      const { data } = await listUsers(qVal, p, 15)
      setUsers(data.content)
      setTotalPages(data.totalPages)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers(q, page) }, [q, page, loadUsers])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); loadUsers(q, 0) }, 350)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!window.confirm(`Change ${user.username}'s role to ${newRole}?`)) return
    setActionId(user.id)
    try {
      await updateRole(user.id, newRole)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      showToast(`${user.username} is now ${newRole}`)
    } catch {
      showToast('Role update failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (user) => {
    if (user.id === me?.id) { showToast("You can't delete your own account", 'error'); return }
    if (!window.confirm(`Permanently delete @${user.username}? This cannot be undone.`)) return
    setActionId(user.id)
    try {
      await deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      showToast(`@${user.username} deleted`)
      // refresh stats
      getStats().then(r => setStats(r.data)).catch(() => {})
    } catch {
      showToast('Delete failed', 'error')
    } finally {
      setActionId(null)
    }
  }

  if (me?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Shield size={48} className="text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500">Admin access required</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-primary-500" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users}    label="Total Users"   value={stats?.totalUsers}   color="bg-blue-500" />
          <StatCard icon={Crown}    label="Admins"        value={stats?.adminUsers}    color="bg-purple-500" />
          <StatCard icon={UserX}    label="Regular Users" value={stats?.regularUsers}  color="bg-gray-500" />
          <StatCard icon={FileText} label="Total Posts"   value={stats?.totalPosts}    color="bg-green-500" />
        </div>

        {/* User management */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">User Management</h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search users…"
                aria-label="Search users"
                className="pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-primary-400 dark:focus:border-primary-600 transition-colors w-48"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">No users found</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors
                    ${actionId === user.id ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.displayName || user.username}
                      </span>
                      {user.role === 'ADMIN' && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">@{user.username} · {user.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{user.postsCount} posts · {user.followersCount} followers</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRoleToggle(user)}
                      disabled={user.id === me?.id}
                      title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      aria-label={user.role === 'ADMIN' ? `Demote ${user.username} to user` : `Promote ${user.username} to admin`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Crown size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={user.id === me?.id}
                      title="Delete account"
                      aria-label={`Delete ${user.username}'s account`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page + 1 >= totalPages}
                className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-40 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Next page"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg transition-all
            ${toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white'}`}
        >
          {toast.type === 'error' && <AlertTriangle size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
