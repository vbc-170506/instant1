// pages/Register/Register.jsx - Registration form for businesses and agencies
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'business',
    agencyName: '', description: '', services: '', location: '', workersCount: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        services: formData.services ? formData.services.split(',').map(s => s.trim()) : [],
        workersCount: parseInt(formData.workersCount) || 0,
      };
      const user = await register(payload);
      navigate(user.role === 'business' ? '/dashboard/business' : '/dashboard/agency');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white text-center">
            <h1 className="text-2xl font-bold">Join Instant</h1>
            <p className="text-blue-100 text-sm mt-1">Create your free account</p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {['business', 'agency'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                        formData.role === role
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {role === 'business' ? '🏢 Business' : '🏭 Agency'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@company.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min. 6 characters" />
              </div>

              {/* Agency-specific fields */}
              {formData.role === 'agency' && (
                <>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Agency Details</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
                        <input type="text" name="agencyName" value={formData.agencyName} onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your Agency Name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="What does your agency specialize in?" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Services (comma-separated)</label>
                        <input type="text" name="services" value={formData.services} onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Web Development, Design, Marketing" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input type="text" name="location" value={formData.location} onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mumbai, India" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                          <input type="number" name="workersCount" value={formData.workersCount} onChange={handleChange} min={1}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formData.role === 'agency' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
                  ⚠️ Agency accounts require admin approval before you can submit proposals.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
