// components/Navbar/Navbar.jsx - Top navigation bar
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'business' ? '/dashboard/business' : '/dashboard/agency';

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Instant</span>
            <span className="hidden sm:block text-xs text-gray-400 font-medium">Talent. Trust. Time.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Dashboard
                </Link>
                {user.role === 'agency' && (
                  <Link to="/requests" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Browse Jobs
                  </Link>
                )}
                {user.role === 'business' && (
                  <Link to="/post-request" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Post Job
                  </Link>
                )}
                <Link to="/chat" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Messages
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
            {user ? (
              <>
                <Link to={dashboardPath} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Dashboard</Link>
                <Link to="/requests" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Browse Jobs</Link>
                <Link to="/chat" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Messages</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50 rounded">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">Login</Link>
                <Link to="/register" className="block px-4 py-2 text-blue-600 font-medium hover:bg-gray-50 rounded">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
