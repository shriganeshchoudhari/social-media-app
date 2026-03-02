import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Settings, User, Lock, Trash2, AlertTriangle, Check, Eye, EyeOff, Bell } from 'lucide-react'
import { selectUser, updateUser as updateUserProfile } from '../store/authSlice.js'
import {
  fetchPreferences,
  updatePreferenceThunk,
  selectPreferences,
  selectPrefsLoading,
} from '../store/notifPreferencesSlice.js'
import client from '../api/client.js'
import Avatar from '../components/ui/Avatar.jsx'
import Button from '../components/ui/Button.jsx'

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User     },
  { id: 'notifications', label: 'Notifications',  icon: Bell     },
  { id: 'password',      label: 'Password',       icon: Lock     },
  { id: 'account',       label: 'Account',        icon: Settings },
]

// ── Profile form ─────────────────────────────────────────────
function ProfileSettings({ user }) {
  const dispatch = useDispatch()
  const [form, setForm]     = useState({
    displayName: user?.displayName || '',
    bio:         user?.bio         || '',
    avatarUrl:   user?.avatarUrl   || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState(null)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const { data } = await client.put('/users/me', form)
      dispatch(updateUserProfile(data))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar src={form.avatarUrl || user?.avatarUrl} name={form.displayName || user?.username} size="lg" />
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Avatar URL</label>
          <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange}
            placeholder="https://example.com/avatar.jpg" aria-label="Avatar URL"
            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-primary-400 dark:focus:border-primary-600 transition-colors" />
        </div>
      </div>
      <div>
        <label htmlFor="displayName" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Display name <span className="text-gray-400">(max 60)</span>
        </label>
        <input id="displayName" name="displayName" value={form.displayName} onChange={handleChange}
          maxLength={60} aria-label="Display name"
          className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-primary-400 dark:focus:border-primary-600 transition-colors" />
      </div>
      <div>
        <label htmlFor="bio" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Bio <span className="text-gray-400">(max 200)</span>
        </label>
        <textarea id="bio" name="bio" value={form.bio} onChange={handleChange}
          maxLength={200} rows={3} aria-label="Bio"
          placeholder="Tell people a little about yourself…"
          className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-primary-400 dark:focus:border-primary-600 transition-colors resize-none" />
        <p className="text-xs text-gray-400 mt-0.5 text-right">{form.bio.length}/200</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button onClick={handleSave} loading={saving} disabled={saving}>
        {saved ? <><Check size={14} className="inline mr-1" />Saved!</> : 'Save changes'}
      </Button>
    </div>
  )
}

// ── Notification preferences ──────────────────────────────────

const PREF_LABELS = {
  LIKE:            { label: 'Likes',            description: 'When someone likes your posts'           },
  COMMENT:         { label: 'Comments',          description: 'When someone comments on your posts'     },
  REPLY:           { label: 'Replies',           description: 'When someone replies to your comments'   },
  FOLLOW:          { label: 'New followers',     description: 'When someone follows you'                },
  MENTION:         { label: 'Mentions',          description: 'When someone mentions you in a post'     },
  SHARE:           { label: 'Shares',            description: 'When someone shares your post'           },
  FOLLOW_REQUEST:  { label: 'Follow requests',   description: 'When someone requests to follow you'     },
  FOLLOW_ACCEPTED: { label: 'Follow accepted',   description: 'When a follow request of yours is accepted' },
}

function Toggle({ enabled, onChange, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={() => onChange(!enabled)}
      aria-checked={enabled}
      role="switch"
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        ${enabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}
      `}
    >
      <span className={`
        pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
        transform transition-transform duration-200
        ${enabled ? 'translate-x-4' : 'translate-x-0'}
      `} />
    </button>
  )
}

function NotificationSettings() {
  const dispatch   = useDispatch()
  const prefs      = useSelector(selectPreferences)
  const loading    = useSelector(selectPrefsLoading)

  useEffect(() => { dispatch(fetchPreferences()) }, [dispatch])

  const handleToggle = (type, value) => {
    dispatch(updatePreferenceThunk({ type, inApp: value }))
  }

  if (loading && Object.keys(prefs).length === 0) {
    return <div className="flex justify-center py-8 text-gray-400 text-sm">Loading preferences…</div>
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Control which in-app notifications you receive. Changes take effect immediately.
      </p>
      {Object.entries(PREF_LABELS).map(([type, { label, description }]) => {
        const enabled = prefs[type] !== false  // default true when not yet loaded
        return (
          <div key={type}
            className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
            <Toggle
              enabled={enabled}
              onChange={(val) => handleToggle(type, val)}
              testId={`pref-toggle-${type.toLowerCase()}`}
            />
          </div>
        )
      })}
    </div>
  )
}

// ── Password form ─────────────────────────────────────────────
function PasswordSettings() {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState(null)
  const [show,   setShow]   = useState({ current: false, next: false, confirm: false })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const toggle = (field) => setShow(s => ({ ...s, [field]: !s[field] }))

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) { setError("New passwords don't match"); return }
    if (form.newPassword.length < 8)               { setError('New password must be at least 8 characters'); return }
    setSaving(true); setError(null)
    try {
      await client.put('/users/me/password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed')
    } finally { setSaving(false) }
  }

  const PasswordInput = ({ id, label, field, showKey }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input id={id} name={field} type={show[showKey] ? 'text' : 'password'}
          value={form[field]} onChange={handleChange}
          autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'}
          className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 outline-none focus:border-primary-400 dark:focus:border-primary-600 transition-colors" />
        <button type="button" onClick={() => toggle(showKey)}
          aria-label={show[showKey] ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <PasswordInput id="currentPassword" label="Current password"    field="currentPassword" showKey="current" />
      <PasswordInput id="newPassword"     label="New password"         field="newPassword"     showKey="next"    />
      <PasswordInput id="confirmPassword" label="Confirm new password" field="confirmPassword" showKey="confirm" />
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      {saved && <p className="text-sm text-green-600 flex items-center gap-1"><Check size={14} />Password updated!</p>}
      <Button onClick={handleSave} loading={saving}
        disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}>
        Change password
      </Button>
    </div>
  )
}

// ── Account / danger zone ─────────────────────────────────────
function AccountSettings({ user }) {
  const [confirming,   setConfirming]   = useState(false)
  const [confirmText,  setConfirmText]  = useState('')

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account details</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Username</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">@{user?.username}</span>
          <span className="text-gray-500">Email</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email}</span>
          <span className="text-gray-500">Role</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{user?.role?.toLowerCase() || 'user'}</span>
          <span className="text-gray-500">Joined</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '–'}
          </span>
        </div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-1">
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Privacy & data</h3>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Your data is stored securely. Posts can be set to Public, Followers only, or Private when creating them.
          Contact support to request a full data export.
        </p>
      </div>
      <div className="border border-red-200 dark:border-red-900 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Deleting your account is permanent and cannot be undone. All your posts, comments, and data will be removed.
        </p>
        {!confirming ? (
          <button onClick={() => setConfirming(true)}
            className="text-sm font-medium text-red-500 hover:text-red-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded">
            Delete my account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-medium">
              Type your username <strong>{user?.username}</strong> to confirm:
            </p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
              placeholder={user?.username} aria-label="Confirm username to delete account"
              className="w-full text-sm bg-white dark:bg-gray-900 border border-red-300 dark:border-red-700 rounded-lg px-3 py-2 outline-none focus:border-red-500" />
            <div className="flex items-center gap-3">
              <button onClick={() => { setConfirming(false); setConfirmText('') }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus-visible:underline">
                Cancel
              </button>
              <Button variant="danger" disabled={confirmText !== user?.username}
                onClick={() => alert('Account deletion endpoint not yet wired up.')}>
                <Trash2 size={14} className="inline mr-1" />Delete account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function SettingsPage() {
  const user         = useSelector(selectUser)
  const [tab, setTab] = useState('profile')

  const ActiveComponent = {
    profile:       <ProfileSettings  user={user} />,
    notifications: <NotificationSettings />,
    password:      <PasswordSettings />,
    account:       <AccountSettings  user={user} />,
  }[tab]

  return (
    <div className="bg-white dark:bg-gray-900 sm:rounded-xl sm:border sm:border-gray-200 dark:sm:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-primary-500" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        </div>
      </div>

      <div className="flex">
        {/* Left tab list */}
        <nav role="tablist" aria-label="Settings sections"
          className="flex flex-col gap-1 p-3 border-r border-gray-100 dark:border-gray-800 w-40 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id}
              data-testid={`settings-tab-${id}`}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                ${tab === id
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main role="tabpanel" aria-label={TABS.find(t => t.id === tab)?.label}
          className="flex-1 p-6">
          {ActiveComponent}
        </main>
      </div>
    </div>
  )
}
