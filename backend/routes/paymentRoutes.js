// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, authorize('business'), createOrder);
router.post('/verify', protect, authorize('business'), verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
