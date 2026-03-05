// pages/BusinessDashboard/BusinessDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI, proposalsAPI, paymentsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 p-6 flex items-center space-x-4 shadow-sm`}>
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ requests: 0, proposals: 0, inProgress: 0, completed: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqRes] = await Promise.all([requestsAPI.getAll({ limit: 5 })]);
        const requests = reqRes.data.requests;
        setRecentRequests(requests);
        setStats({
          requests: reqRes.data.total,
          inProgress: requests.filter(r => r.status === 'in_progress').length,
          completed: requests.filter(r => r.status === 'completed').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statusBadge = (status) => {
    const map = {
      open: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your projects.</p>
          </div>
          <Link
            to="/post-request"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            + Post New Job
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-24"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Requests" value={stats.requests} icon="📋" color="bg-blue-100" />
            <StatCard label="In Progress" value={stats.inProgress} icon="⚙️" color="bg-yellow-100" />
            <StatCard label="Completed" value={stats.completed} icon="✅" color="bg-green-100" />
            <StatCard label="Active Chats" value="—" icon="💬" color="bg-purple-100" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/post-request', icon: '➕', title: 'Post a Job', desc: 'Create a new service request', color: 'from-blue-500 to-blue-600' },
            { to: '/proposals', icon: '📨', title: 'View Proposals', desc: 'Review agency proposals', color: 'from-purple-500 to-purple-600' },
            { to: '/payments', icon: '💳', title: 'Payments', desc: 'Track your transactions', color: 'from-green-500 to-green-600' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-5 hover:opacity-90 transition-opacity shadow-md`}
            >
              <span className="text-2xl mb-3 block">{action.icon}</span>
              <p className="font-semibold">{action.title}</p>
              <p className="text-sm opacity-80 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Job Requests</h2>
            <Link to="/requests" className="text-blue-600 text-sm font-medium hover:text-blue-700">View all →</Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>No requests yet. <Link to="/post-request" className="text-blue-600 font-medium">Post your first job</Link></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRequests.map((req) => (
                <div key={req._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <Link to={`/requests/${req._id}`} className="font-medium text-gray-900 hover:text-blue-600">{req.title}</Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Budget: ₹{req.budget?.toLocaleString()} · {req.proposalCount} proposals
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {statusBadge(req.status)}
                    <Link to={`/proposals?requestId=${req._id}`} className="text-blue-600 text-sm hover:underline">
                      View proposals
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusinessDashboard;
