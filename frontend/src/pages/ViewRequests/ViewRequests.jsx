// pages/ViewRequests/ViewRequests.jsx - Browse and manage service requests
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';

const ViewRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const { data } = await requestsAPI.getAll(params);
      setRequests(data.requests);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await requestsAPI.delete(id);
      setRequests(requests.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const statusColor = {
    open: 'bg-green-100 text-green-700 border-green-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-gray-100 text-gray-600 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const filtered = requests.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'business' ? 'My Job Requests' : 'Browse Jobs'}
            </h1>
            <p className="text-gray-500 mt-1">
              {user?.role === 'business' ? 'Manage your posted jobs.' : 'Find jobs to submit proposals.'}
            </p>
          </div>
          {user?.role === 'business' && (
            <Link to="/post-request" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 text-sm">
              + Post Job
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests..."
            className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">No requests found.</p>
            {user?.role === 'business' && (
              <Link to="/post-request" className="text-blue-600 font-medium text-sm mt-2 block">Post your first job →</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => (
              <div key={req._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link to={`/requests/${req._id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {req.title}
                        </Link>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColor[req.status]}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{req.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>💰 ₹{req.budget?.toLocaleString()}</span>
                        <span>🏷️ {req.category}</span>
                        <span>📍 {req.location}</span>
                        <span>⏰ Due: {new Date(req.deadline).toLocaleDateString()}</span>
                        <span>📨 {req.proposalCount} proposals</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {user?.role === 'agency' && req.status === 'open' && (
                        <Link
                          to={`/proposals?requestId=${req._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View & Apply
                        </Link>
                      )}
                      {user?.role === 'business' && (
                        <>
                          <Link
                            to={`/proposals?requestId=${req._id}`}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50"
                          >
                            Proposals ({req.proposalCount})
                          </Link>
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="text-red-500 hover:text-red-700 px-3 py-2 rounded-xl text-sm hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewRequests;
