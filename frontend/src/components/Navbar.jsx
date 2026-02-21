import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import Avatar from './Avatar';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'text-primary bg-primary-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary flex-shrink-0">
            <span className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-sm">SH</span>
            <span className="hidden sm:block">SocialHub</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
              />
            </div>
          </form>

          {/* Nav links */}
          <div className="flex items-center gap-1 ml-auto">
            <NavLink to="/" end className={navLinkClass}>
              <span>🏠</span>
              <span className="hidden md:block">Home</span>
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              <span>🔥</span>
              <span className="hidden md:block">Explore</span>
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              <span>🔍</span>
              <span className="hidden md:block sm:hidden block">Search</span>
            </NavLink>

            {/* Profile dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition"
              >
                <Avatar src={user?.profilePictureUrl} name={user?.displayName || user?.username} size="sm" />
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user?.displayName || user?.username}
                </span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 z-50 py-1.5 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">{user?.displayName}</p>
                      <p className="text-xs text-gray-400">@{user?.username}</p>
                    </div>
                    <Link
                      to={`/profile/${user?.username}`}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span>👤</span> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span>⚙️</span> Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
