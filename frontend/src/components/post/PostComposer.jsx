import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Globe, Users, Lock, X, Sparkles } from 'lucide-react'
import { createPostThunk } from '../../store/postsSlice.js'
import { selectUser } from '../../store/authSlice.js'
import { uploadMedia } from '../../api/media.js'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import { openAiPanel, sendChatMessage } from '../../store/aiSlice.js'

const PRIVACY_OPTIONS = [
  { value: 'PUBLIC',         label: 'Public',          Icon: Globe },
  { value: 'FOLLOWERS_ONLY', label: 'Followers only',  Icon: Users },
  { value: 'PRIVATE',        label: 'Only me',         Icon: Lock },
]

export default function PostComposer({ onPost }) {
  const dispatch  = useDispatch()
  const me        = useSelector(selectUser)
  const fileRef   = useRef()
  const [content,  setContent]  = useState('')
  const [privacy,  setPrivacy]  = useState('PUBLIC')
  const [preview,  setPreview]  = useState(null)   // local blob preview
  const [imageUrl, setImageUrl] = useState(null)   // uploaded URL
  const [uploading, setUploading] = useState(false)
  const [posting,   setPosting]  = useState(false)
  const [error,     setError]    = useState(null)

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

  /**
   * Open the Spark AI panel pre-filled with a post-improvement request.
   * The AI panel takes it from there — user sees the suggestion in the chat.
   */
  const handleImproveWithAi = () => {
    if (!content.trim()) return
    dispatch(openAiPanel())
    dispatch(
      sendChatMessage(
        `Help me improve this post draft:\n\n"${content.trim()}"`,
        'post_improve'
      )
    )
  }

  const charLimit = 2000
  const remaining = charLimit - content.length

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex gap-3">
        <Avatar src={me?.avatarUrl} name={me?.displayName || me?.username} size="md" />

        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={charLimit}
            rows={3}
            className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed"
          />

          {/* Image preview */}
          {preview && (
            <div className="relative inline-block">
              <img src={preview} alt="preview" className="rounded-xl max-h-48 object-cover border border-gray-100" />
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                  <span className="text-sm text-gray-500">Uploading…</span>
                </div>
              )}
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ✨ Improve with AI button — only shown when there's draft content */}
          {content.trim().length > 0 && (
            <button
              onClick={handleImproveWithAi}
              data-testid="improve-with-ai-btn"
              title="Ask Spark to improve this draft"
              className="
                self-start flex items-center gap-1.5 px-3 py-1.5
                text-xs font-medium text-purple-600
                border border-purple-200 rounded-full
                hover:bg-purple-50 hover:border-purple-300
                transition-colors
              "
            >
              <Sparkles size={13} />
              Improve with AI
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Toolbar */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              {/* Image upload */}
              <button
                onClick={() => fileRef.current.click()}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary-500 transition-colors"
                title="Add image"
              >
                <Image size={18} />
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/mp4" className="hidden" onChange={handleFile} />

              {/* Privacy selector */}
              <select
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
                className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 outline-none hover:border-gray-300 cursor-pointer"
              >
                {PRIVACY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs ${remaining < 100 ? 'text-orange-500' : 'text-gray-400'}`}>
                {remaining}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || uploading}
                loading={posting}
                size="sm"
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
