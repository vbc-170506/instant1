// routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendProposal,
  getProposalsForRequest,
  getMyProposals,
  acceptProposal,
  rejectProposal,
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/send', protect, authorize('agency'), sendProposal);
router.get('/my', protect, authorize('agency'), getMyProposals);
router.get('/request/:id', protect, authorize('business', 'admin'), getProposalsForRequest);
router.put('/accept/:id', protect, authorize('business'), acceptProposal);
router.put('/reject/:id', protect, authorize('business'), rejectProposal);

module.exports = router;
