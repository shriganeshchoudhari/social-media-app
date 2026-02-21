import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../redux/postSlice';
import Avatar from './Avatar';

const CreatePostForm = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const MAX_CHARS = 5000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      await dispatch(createPost({ content, privacyLevel })).unwrap();
      setContent('');
    } catch (err) {
      setError(err || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining < 100 && remaining >= 0;

  return (
    <div className="card mb-4">
      <div className="flex gap-3">
        <Avatar src={user?.profilePictureUrl} name={user?.displayName || user?.username} size="md" className="mt-0.5" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none border-0 outline-none text-gray-800 text-sm placeholder-gray-400 bg-transparent leading-relaxed min-h-[72px]"
            rows="3"
            maxLength={MAX_CHARS + 100}
          />

          {error && (
            <p className="text-red-500 text-xs mb-2">{error}</p>
          )}

          <div className="divider my-2" />

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {/* Privacy selector */}
              <select
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="public">🌐 Public</option>
                <option value="friends">👥 Friends</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Character counter */}
              {content.length > 0 && (
                <span className={`text-xs ${isOverLimit ? 'text-red-500 font-semibold' : isNearLimit ? 'text-amber-500' : 'text-gray-400'}`}>
                  {remaining}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim() || isOverLimit}
                className="btn btn-primary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
