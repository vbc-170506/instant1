// components/Sidebar/Sidebar.jsx - Dashboard sidebar navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const businessLinks = [
  { path: '/dashboard/business', label: 'Overview', icon: '🏠' },
  { path: '/post-request', label: 'Post a Job', icon: '➕' },
  { path: '/requests', label: 'My Requests', icon: '📋' },
  { path: '/proposals', label: 'Proposals', icon: '📨' },
  { path: '/chat', label: 'Messages', icon: '💬' },
  { path: '/payments', label: 'Payments', icon: '💳' },
];

const agencyLinks = [
  { path: '/dashboard/agency', label: 'Overview', icon: '🏠' },
  { path: '/requests', label: 'Browse Jobs', icon: '🔍' },
  { path: '/proposals', label: 'My Proposals', icon: '📤' },
  { path: '/chat', label: 'Messages', icon: '💬' },
  { path: '/payments', label: 'Earnings', icon: '💰' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === 'business' ? businessLinks : agencyLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen pt-20 fixed left-0 top-0 z-40 shadow-sm hidden md:block">
      <div className="px-4 py-6">
        {/* User info */}
        <div className="flex items-center space-x-3 mb-8 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
            <span className="text-xs text-blue-600 font-medium capitalize bg-blue-100 px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
