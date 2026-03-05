// pages/Payments/Payments.jsx - Payment management with Razorpay
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paymentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';

const Payments = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('proposalId');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await paymentsAPI.getHistory();
        setPayments(data.payments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!proposalId) return;
    setError('');
    setPaying(true);
    try {
      // Step 1: Create Razorpay order
      const { data: orderData } = await paymentsAPI.createOrder({ proposalId });

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: orderData.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Instant Platform',
        description: 'Service Payment',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Step 4: Verify payment on backend
            await paymentsAPI.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentId: orderData.paymentId,
            });
            setSuccess('Payment completed successfully! 🎉');
            const { data } = await paymentsAPI.getHistory();
            setPayments(data.payments);
          } catch (verifyErr) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setPaying(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status]}`}>{status}</span>
    );
  };

  const totalEarned = payments
    .filter(p => p.status === 'completed' && (user.role === 'agency' ? p.agencyId?._id === user.id : true))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'business' ? 'Payments' : 'Earnings'}
            </h1>
            <p className="text-gray-500 mt-1">Track your payment history and transactions.</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl mb-6">
              <p className="font-semibold">{success}</p>
            </div>
          )}

          {/* Pay Now Banner */}
          {proposalId && user.role === 'business' && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8 flex items-center justify-between shadow-lg">
              <div>
                <h2 className="text-lg font-bold mb-1">Complete Your Payment</h2>
                <p className="text-blue-100 text-sm">A proposal has been accepted. Proceed to payment to get started.</p>
              </div>
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center"
              >
                {paying ? <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" /> : null}
                Pay Now 💳
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{user.role === 'agency' ? 'Total Earned' : 'Total Spent'}</p>
              <p className="text-2xl font-bold text-green-600">₹{totalEarned.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'completed').length}</p>
            </div>
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Transaction History</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">💳</p>
                <p>No transactions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map((pay) => (
                  <div key={pay._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{pay.requestId?.title || 'Service Payment'}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                        <span>{user.role === 'business' ? `To: ${pay.agencyId?.name}` : `From: ${pay.businessId?.name}`}</span>
                        <span>·</span>
                        <span>{new Date(pay.createdAt).toLocaleDateString()}</span>
                        {pay.razorpayPaymentId && (
                          <>
                            <span>·</span>
                            <span className="font-mono">{pay.razorpayPaymentId.slice(0, 12)}...</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {statusBadge(pay.status)}
                      <span className={`font-bold ${pay.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                        ₹{pay.amount?.toLocaleString()}
                      </span>
                    </div>
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

export default Payments;
