// pages/PostRequest/PostRequest.jsx - Form to create a service request
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';

const CATEGORIES = [
  'Web Development', 'Mobile App', 'Design & Creative', 'Digital Marketing',
  'Content Writing', 'Data Entry', 'Accounting', 'Legal Services',
  'HR & Recruitment', 'IT Support', 'Manufacturing', 'Logistics', 'Other'
];

const PostRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', budget: '', deadline: '',
    category: '', location: 'Remote'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (parseFloat(formData.budget) <= 0) return setError('Budget must be greater than 0');
    setLoading(true);
    try {
      await requestsAPI.create({ ...formData, budget: parseFloat(formData.budget) });
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-gray-500 mt-1">Describe your requirements and receive proposals from agencies.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Build an e-commerce website with payment integration" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={5}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe what you need, key features, tech requirements, expectations..." />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/3000 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Remote / Mumbai" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input type="number" name="budget" value={formData.budget} onChange={handleChange} required min={1}
                      className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline *</label>
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                <button type="button" onClick={() => navigate(-1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center text-sm">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Post Job Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostRequest;
