// pages/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'all'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which agency is being actioned

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, agenciesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAgencies({ status: filter === 'all' ? undefined : filter }),
      ]);
      setStats(statsRes.data.stats);
      setAgencies(agenciesRes.data.agencies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminAPI.approveAgency(id);
      setAgencies((prev) =>
        prev.map((a) => a._id === id ? { ...a, isApproved: true } : a)
      );
    } catch (err) {
      alert('Failed to approve agency.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Revoke approval for this agency?')) return;
    setActionLoading(id);
    try {
      await adminAPI.rejectAgency(id);
      setAgencies((prev) =>
        prev.map((a) => a._id === id ? { ...a, isApproved: false } : a)
      );
    } catch (err) {
      alert('Failed to reject agency.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-6 pb-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage agencies, users, and platform activity.</p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Businesses', value: stats.totalUsers, icon: '🏢', color: 'bg-blue-50' },
              { label: 'Total Agencies', value: stats.totalAgencies, icon: '🏭', color: 'bg-purple-50' },
              { label: 'Pending Approval', value: stats.pendingAgencies, icon: '⏳', color: 'bg-yellow-50' },
              { label: 'Job Requests', value: stats.totalRequests, icon: '📋', color: 'bg-green-50' },
              { label: 'Payments Done', value: stats.totalPayments, icon: '💳', color: 'bg-pink-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl border border-gray-200 p-5 shadow-sm`}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Agency Management */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Agency Management</h2>
            {/* Filter tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 space-x-1">
              {['pending', 'approved', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    filter === tab
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">🏭</p>
              <p>No agencies found for this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {agencies.map((agency) => (
                <div key={agency._id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {agency.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">{agency.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          agency.isApproved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {agency.isApproved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{agency.email}</p>
                      {agency.profile && (
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                          <span>🏢 {agency.profile.agencyName}</span>
                          <span>·</span>
                          <span>📍 {agency.profile.location}</span>
                          <span>·</span>
                          <span>👥 {agency.profile.workersCount} workers</span>
                          {agency.profile.services?.length > 0 && (
                            <>
                              <span>·</span>
                              <span>🛠 {agency.profile.services.slice(0, 2).join(', ')}</span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Registered: {new Date(agency.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                    {!agency.isApproved ? (
                      <button
                        onClick={() => handleApprove(agency._id)}
                        disabled={actionLoading === agency._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                      >
                        {actionLoading === agency._id
                          ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          : <span>✓ Approve</span>
                        }
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(agency._id)}
                        disabled={actionLoading === agency._id}
                        className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading === agency._id
                          ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : 'Revoke'
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;