// pages/Home/Home.jsx - Landing page
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    { icon: '🏢', title: 'Post Service Requests', desc: 'MSMEs can post detailed job requirements and find the perfect agency.' },
    { icon: '📨', title: 'Receive Proposals', desc: 'Get competitive proposals from verified agencies with pricing.' },
    { icon: '💬', title: 'Real-time Chat', desc: 'Communicate instantly with agencies via built-in messaging.' },
    { icon: '💳', title: 'Secure Payments', desc: 'Pay safely through Razorpay with full transaction tracking.' },
  ];

  const stats = [
    { value: '500+', label: 'MSMEs Served' },
    { value: '200+', label: 'Verified Agencies' },
    { value: '₹2Cr+', label: 'Transactions Processed' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            🚀 Connecting MSMEs with Top Agencies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Talent. Trust. <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Time.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Instant connects small and medium businesses with skilled agencies — faster hiring, trusted partners, real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to={user.role === 'business' ? '/dashboard/business' : '/dashboard/agency'}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-blue-600">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            A complete platform to streamline how businesses and agencies work together.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-blue-100 mb-8 text-lg">Join hundreds of businesses and agencies already on Instant.</p>
        <Link
          to="/register"
          className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors inline-block shadow-lg"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <p className="text-sm">© 2024 Instant · Talent. Trust. Time. · Built for MSMEs across India</p>
      </footer>
    </div>
  );
};

export default Home;
