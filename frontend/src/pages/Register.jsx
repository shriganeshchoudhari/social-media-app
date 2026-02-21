import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register, fetchCurrentUser } from '../redux/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const validate = () => {
    const errors = {};
    if (formData.username.length < 3) errors.username = 'At least 3 characters';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email required';
    if (formData.password.length < 8) errors.password = 'At least 8 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setError('');
    setLoading(true);
    try {
      await dispatch(register(formData)).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-md mb-4">
            <span className="text-white text-2xl font-bold">SH</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join SocialHub today</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input ${fieldErrors.username ? 'border-red-400 focus:ring-red-200' : ''}`}
                  placeholder="johndoe"
                  required
                  autoComplete="username"
                />
                {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${fieldErrors.email ? 'border-red-400 focus:ring-red-200' : ''}`}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${fieldErrors.password ? 'border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
              />
              {fieldErrors.password
                ? <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                : formData.password.length > 0 && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          formData.password.length >= i * 3
                            ? formData.password.length >= 10 ? 'bg-green-400' : 'bg-amber-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )
              }
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
