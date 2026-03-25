// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAllAgencies, approveAgency, rejectAgency, getStats, getAllUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require login + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/agencies', getAllAgencies);
router.put('/agencies/approve/:id', approveAgency);
router.put('/agencies/reject/:id', rejectAgency);

module.exports = router;