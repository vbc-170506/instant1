// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('business'), createRequest);
router.get('/', protect, getAllRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id', protect, authorize('business'), updateRequest);
router.delete('/:id', protect, authorize('business'), deleteRequest);

module.exports = router;
