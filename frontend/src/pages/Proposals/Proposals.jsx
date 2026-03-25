// pages/Proposals/Proposals.jsx - View, submit, and manage proposals
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { proposalsAPI, requestsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';

const Proposals = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ price: '', message: '', estimatedDays: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'business' && requestId) {
          const [propRes, reqRes] = await Promise.all([
            proposalsAPI.getForRequest(requestId),
            requestsAPI.getById(requestId),
          ]);
          setProposals(propRes.data.proposals);
          setRequest(reqRes.data.request);
        } else if (user.role === 'agency') {
          const { data } = await proposalsAPI.getMy();
          setProposals(data.proposals);
          if (requestId) {
            const { data: rd } = await requestsAPI.getById(requestId);
            setRequest(rd.request);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId, user.role]);

  const handleAccept = async (id) => {
    try {
      await proposalsAPI.accept(id);
      setProposals(proposals.map(p => ({
        ...p,
        status: p._id === id ? 'accepted' : 'rejected'
      })));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept.');
    }
  };

  const handleReject = async (id) => {
    try {
      await proposalsAPI.reject(id);
      setProposals(proposals.map(p => p._id === id ? { ...p, status: 'rejected' } : p));
    } catch (err) {
      alert('Failed to reject.');
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await proposalsAPI.send({
        requestId,
        price: parseFloat(formData.price),
        message: formData.message,
        estimatedDays: parseInt(formData.estimatedDays),
      });
      setProposals([...proposals, data.proposal]);
      setShowForm(false);
      setFormData({ price: '', message: '', estimatedDays: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status]}`}>{status}</span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'business' ? 'Received Proposals' : 'My Proposals'}
            </h1>
            {request && (
              <p className="text-gray-500 mt-1">For: <span className="font-medium text-gray-700">{request.title}</span></p>
            )}
          </div>

          {/* Agency approval warning */}
{user.role === 'agency' && !user.isApproved && (
  <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm">
    Your account is not approved by admin yet. You cannot submit proposals.
  </div>
)}

{/* Agency submit proposal form */}
{user.role === 'agency' && user.isApproved && requestId && (
  <div className="mb-6">
    {!showForm ? (
      <button onClick={() => setShowForm(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 text-sm">
        + Submit Proposal for This Job
      </button>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Submit Your Proposal</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Price (₹) *</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required min={1}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="45000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Days *</label>
              <input type="number" value={formData.estimatedDays} onChange={e => setFormData({ ...formData, estimatedDays: e.target.value })} required min={1}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Message *</label>
            <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Why is your agency the best fit for this job? Highlight your experience..." />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
              Submit Proposal
            </button>
          </div>
        </form>
      </div>
    )}
  </div>
)}

          {/* Proposals list */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse h-32" />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📨</p>
              <p>No proposals yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div key={prop._id} className={`bg-white rounded-2xl border shadow-sm p-6 ${prop.status === 'accepted' ? 'border-green-300' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-700">
                          {(prop.agencyId?.name || prop.requestId?.title || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {user.role === 'business' && (
                            <p className="font-semibold text-gray-900">{prop.agencyId?.name}</p>
                          )}
                          {user.role === 'agency' && (
                            <p className="font-semibold text-gray-900">{prop.requestId?.title}</p>
                          )}
                          <p className="text-xs text-gray-400">{new Date(prop.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {statusBadge(prop.status)}
                      <span className="text-lg font-bold text-gray-900">₹{prop.price?.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{prop.message}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">⏱️ Estimated: {prop.estimatedDays} days</span>
                    {user.role === 'business' && prop.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button onClick={() => handleReject(prop._id)}
                          className="border border-red-300 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50">
                          Reject
                        </button>
                        <button onClick={() => handleAccept(prop._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
                          Accept Proposal
                        </button>
                      </div>
                    )}
                    {user.role === 'business' && prop.status === 'accepted' && (
                      <button onClick={() => navigate(`/payments?proposalId=${prop._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                        Proceed to Payment →
                      </button>
                    )}
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

export default Proposals;
