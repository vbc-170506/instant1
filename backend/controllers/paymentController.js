// controllers/paymentController.js - Razorpay payment integration
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Proposal = require('../models/Proposal');
const ServiceRequest = require('../models/ServiceRequest');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (Business only)
const createOrder = async (req, res) => {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found.' });
    if (proposal.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Proposal must be accepted before payment.' });
    }

    const request = await ServiceRequest.findById(proposal.requestId);
    if (request.businessId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      proposalId,
      status: { $in: ['pending', 'completed'] },
    });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed.' });
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(proposal.price * 100),
      currency: 'INR',
      receipt: `receipt_${proposalId}_${Date.now()}`,
      notes: {
        proposalId: proposalId,
        requestId: proposal.requestId.toString(),
        businessId: req.user.id,
      },
    });

    // Save or update payment record
    const payment = await Payment.create({
      requestId: proposal.requestId,
      proposalId,
      businessId: req.user.id,
      agencyId: proposal.agencyId,
      amount: proposal.price,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error creating payment order.' });
  }
};

// @desc    Verify payment after Razorpay checkout
// @route   POST /api/payments/verify
// @access  Private (Business only)
const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    // Verify signature (HMAC SHA256)
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
      },
      { new: true }
    );

    // Update service request to completed
    await ServiceRequest.findByIdAndUpdate(payment.requestId, { status: 'completed' });

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully.',
      payment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment.' });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const query =
      req.user.role === 'business'
        ? { businessId: req.user.id }
        : { agencyId: req.user.id };

    const payments = await Payment.find(query)
      .populate('requestId', 'title')
      .populate('businessId', 'name email')
      .populate('agencyId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
