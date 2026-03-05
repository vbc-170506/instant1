// pages/AgencyDashboard/AgencyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestsAPI, proposalsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';

const AgencyDashboard = () => {
  const { user } = useAuth();
  const [openRequests, setOpenRequests] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqRes, propRes] = await Promise.all([
          requestsAPI.getAll({ status: 'open', limit: 5 }),
          proposalsAPI.getMy(),
        ]);
        setOpenRequests(reqRes.data.requests);
        setMyProposals(propRes.data.proposals);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const accepted = myProposals.filter(p => p.status === 'accepted').length;
  const pending = myProposals.filter(p => p.status === 'pending').length;

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard 🏭</h1>
          <p className="text-gray-500 mt-1">Browse jobs and manage your proposals.</p>
          {!user?.isApproved && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
              ⏳ Your agency is pending admin approval. You can browse jobs but cannot submit proposals yet.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Proposals', value: myProposals.length, icon: '📤', color: 'bg-blue-100' },
            { label: 'Accepted', value: accepted, icon: '✅', color: 'bg-green-100' },
            { label: 'Pending', value: pending, icon: '⏳', color: 'bg-yellow-100' },
            { label: 'Open Jobs', value: openRequests.length, icon: '🔍', color: 'bg-purple-100' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center space-x-4 shadow-sm">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Open Jobs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Open Jobs</h2>
              <Link to="/requests" className="text-blue-600 text-sm font-medium">Browse all →</Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : openRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No open jobs at the moment.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {openRequests.map((req) => (
                  <div key={req._id} className="px-6 py-4 hover:bg-gray-50">
                    <Link to={`/requests/${req._id}`} className="font-medium text-gray-900 hover:text-blue-600 block">{req.title}</Link>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-500">₹{req.budget?.toLocaleString()}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">{req.category}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-500">{req.proposalCount} proposals</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Proposals */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Proposals</h2>
              <Link to="/proposals" className="text-blue-600 text-sm font-medium">View all →</Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : myProposals.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No proposals yet.</p>
                <Link to="/requests" className="text-blue-600 text-sm font-medium mt-1 block">Find jobs to apply →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myProposals.slice(0, 5).map((prop) => (
                  <div key={prop._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{prop.requestId?.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">₹{prop.price?.toLocaleString()}</p>
                    </div>
                    {statusBadge(prop.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgencyDashboard;
