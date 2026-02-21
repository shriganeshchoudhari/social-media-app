import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, fetchCurrentUser } from '../redux/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await dispatch(login(formData)).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick login helpers for demo
  const fillDemo = (email) => setFormData({ email, password: 'Password123!' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-md mb-4">
            <span className="text-white text-2xl font-bold">SH</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your SocialHub account</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-surface-100 rounded-xl">
            <p className="text-xs font-medium text-gray-600 mb-2">🎯 Demo accounts (password: Password123!)</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('john@example.com')}
                className="flex-1 text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
              >
                john@example.com
              </button>
              <button
                type="button"
                onClick={() => fillDemo('jane@example.com')}
                className="flex-1 text-xs py-1.5 px-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
              >
                jane@example.com
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
