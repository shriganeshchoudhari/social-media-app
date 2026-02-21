import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, logout } from '../redux/authSlice';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    profilePictureUrl: user?.profilePictureUrl || '',
    coverPhotoUrl: user?.coverPhotoUrl || '',
    isPrivate: user?.isPrivate || false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await dispatch(updateProfile(form)).unwrap();
      setSaved(true);
    } catch (err) {
      setError(err || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Profile Section */}
        <div className="card mb-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar src={form.profilePictureUrl} name={form.displayName || user?.username} size="xl" />
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Profile Picture URL</label>
              <input
                name="profilePictureUrl"
                value={form.profilePictureUrl}
                onChange={handleChange}
                className="input text-sm"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Display Name</label>
                <input
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  className="input text-sm"
                  placeholder="Your name"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Username</label>
                <input
                  value={user?.username}
                  disabled
                  className="input text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="input text-sm resize-none"
                rows={3}
                placeholder="Tell people about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input text-sm"
                  placeholder="City, Country"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Website</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="input text-sm"
                  placeholder="https://yourwebsite.com"
                  maxLength={200}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Cover Photo URL</label>
              <input
                name="coverPhotoUrl"
                value={form.coverPhotoUrl}
                onChange={handleChange}
                className="input text-sm"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            {/* Privacy toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">Private Account</p>
                <p className="text-xs text-gray-500">Only approved followers can see your posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={form.isPrivate}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">
                ✓ Profile saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account section */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <span className="badge badge-primary">Verified</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-red-600">Logout</p>
                <p className="text-xs text-gray-500">Sign out of your account</p>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
