import { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Globe, Users, Lock, X, Sparkles } from 'lucide-react'
import { createPostThunk } from '../../store/postsSlice.js'
import { selectUser } from '../../store/authSlice.js'
import { uploadMedia } from '../../api/media.js'
import { searchUsers } from '../../api/search.js'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import { openAiPanel, sendChatMessage } from '../../store/aiSlice.js'

const PRIVACY_OPTIONS = [
  { value: 'PUBLIC',         label: 'Public',          Icon: Globe },
  { value: 'FOLLOWERS_ONLY', label: 'Followers only',  Icon: Users },
  { value: 'PRIVATE',        label: 'Only me',         Icon: Lock },
]

/**
 * MentionDropdown — floats below the textarea cursor position.
 * Shown when user types @<chars> and suggestions are available.
 */
function MentionDropdown({ suggestions, onSelect, activeIndex }) {
  if (!suggestions.length) return null
  return (
    <ul
      role="listbox"
      aria-label="User mentions"
      className="absolute z-50 top-full left-0 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
    >
      {suggestions.map((user, i) => (
        <li key={user.id} role="option" aria-selected={i === activeIndex}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onSelect(user.username) }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
              ${i === activeIndex
                ? 'bg-primary-50 dark:bg-primary-900/30'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="xs" />
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.displayName || user.username}
            </span>
            <span className="text-gray-400 dark:text-gray-500 truncate">@{user.username}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function PostComposer({ onPost }) {
  const dispatch  = useDispatch()
  const me        = useSelector(selectUser)
  const fileRef   = useRef()
  const textareaRef = useRef()

  const [content,   setContent]   = useState('')
  const [privacy,   setPrivacy]   = useState('PUBLIC')
  const [preview,   setPreview]   = useState(null)
  const [imageUrl,  setImageUrl]  = useState(null)
  const [uploading, setUploading] = useState(false)
  const [posting,   setPosting]   = useState(false)
  const [error,     setError]     = useState(null)

  // Mention state
  const [mentionQuery,     setMentionQuery]     = useState(null) // string after @ or null
  const [mentionSuggests,  setMentionSuggests]  = useState([])
  const [mentionActiveIdx, setMentionActiveIdx] = useState(0)
  const mentionTimerRef = useRef(null)

  // ── Mention detection ────────────────────────────────────────
  const detectMention = useCallback((text, cursorPos) => {
    // Scan backwards from cursor to find a bare @word (no space before cursor)
    const before = text.slice(0, cursorPos)
    const match  = before.match(/@(\w{1,30})$/)
    if (match) {
      setMentionQuery(match[1])
    } else {
      setMentionQuery(null)
      setMentionSuggests([])
    }
  }, [])

  // Debounced fetch when mentionQuery changes
  useEffect(() => {
    if (mentionQuery === null) return
    clearTimeout(mentionTimerRef.current)
    if (mentionQuery.length === 0) { setMentionSuggests([]); return }
    mentionTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await searchUsers(mentionQuery, 0, 6)
        setMentionSuggests(data.content || [])
        setMentionActiveIdx(0)
      } catch {
        setMentionSuggests([])
      }
    }, 200)
    return () => clearTimeout(mentionTimerRef.current)
  }, [mentionQuery])

  const handleContentChange = (e) => {
    const val = e.target.value
    setContent(val)
    detectMention(val, e.target.selectionStart)
  }

  /** Replace the @partial at cursor with the selected @username */
  const selectMention = (username) => {
    const ta      = textareaRef.current
    const cursor  = ta.selectionStart
    const before  = content.slice(0, cursor)
    const after   = content.slice(cursor)
    const replaced = before.replace(/@(\w{0,30})$/, `@${username} `)
    setContent(replaced + after)
    setMentionQuery(null)
    setMentionSuggests([])
    // Restore focus after React re-render
    setTimeout(() => {
      ta.focus()
      const newPos = replaced.length
      ta.setSelectionRange(newPos, newPos)
    }, 0)
  }

  /** Handle keyboard navigation inside the mention dropdown */
  const handleKeyDown = (e) => {
    if (mentionSuggests.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionActiveIdx(i => Math.min(i + 1, mentionSuggests.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (mentionSuggests[mentionActiveIdx]) {
        e.preventDefault()
        selectMention(mentionSuggests[mentionActiveIdx].username)
      }
    } else if (e.key === 'Escape') {
      setMentionQuery(null)
      setMentionSuggests([])
    }
  }

  // ── Media ────────────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const { data } = await uploadMedia(file)
      setImageUrl(data.url)
    } catch {
      setError('Image upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    setImageUrl(null)
    fileRef.current.value = ''
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return
    setPosting(true)
    setError(null)
    try {
      await dispatch(createPostThunk({ content: content.trim(), imageUrl, privacy })).unwrap()
      setContent('')
      clearImage()
      onPost?.()
    } catch (err) {
      setError(err)
    } finally {
      setPosting(false)
    }
  }

  const handleImproveWithAi = () => {
    if (!content.trim()) return
    dispatch(openAiPanel())
    dispatch(sendChatMessage(`Help me improve this post draft:\n\n"${content.trim()}"`, 'post_improve'))
  }

  const charLimit = 2000
  const remaining = charLimit - content.length

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
      <div className="flex gap-3">
        <Avatar src={me?.avatarUrl} name={me?.displayName || me?.username} size="md" />

        <div className="flex-1 flex flex-col gap-3">
          {/* Textarea with mention detection */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? Use @username to mention people"
              maxLength={charLimit}
              rows={3}
              aria-label="Post content"
              aria-autocomplete="list"
              aria-expanded={mentionSuggests.length > 0}
              className="w-full resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed bg-transparent"
            />
            <MentionDropdown
              suggestions={mentionSuggests}
              onSelect={selectMention}
              activeIndex={mentionActiveIdx}
            />
          </div>

          {/* Image preview */}
          {preview && (
            <div className="relative inline-block">
              <img src={preview} alt="Post image preview" className="rounded-xl max-h-48 object-cover border border-gray-100 dark:border-gray-800" />
              {uploading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center rounded-xl">
                  <span className="text-sm text-gray-500">Uploading…</span>
                </div>
              )}
              <button
                onClick={clearImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Improve with AI */}
          {content.trim().length > 0 && (
            <button
              onClick={handleImproveWithAi}
              data-testid="improve-with-ai-btn"
              title="Ask Spark to improve this draft"
              aria-label="Improve post with AI"
              className="self-start flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-200 dark:border-purple-800 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 transition-colors"
            >
              <Sparkles size={13} />
              Improve with AI
            </button>
          )}

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          {/* Toolbar */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current.click()}
                aria-label="Add image"
                title="Add image"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-500 transition-colors"
              >
                <Image size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleFile} />

              <select
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
                aria-label="Post privacy"
                className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-full px-3 py-1.5 outline-none hover:border-gray-300 cursor-pointer"
              >
                {PRIVACY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${remaining < 100 ? 'text-orange-500 font-medium' : 'text-gray-400'}`}
                aria-label={`${remaining} characters remaining`}
              >
                {remaining}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || uploading}
                loading={posting}
                size="sm"
                aria-label="Publish post"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
