// controllers/proposalController.js - Proposal management
const Proposal = require('../models/Proposal');
const ServiceRequest = require('../models/ServiceRequest');
const Message = require('../models/Message');

// @desc    Send a proposal for a service request
// @route   POST /api/proposals/send
// @access  Private (Agency only)
const sendProposal = async (req, res) => {
  try {
    // 🔐 BLOCK UNAPPROVED AGENCIES
if (req.user.role === 'agency' && !req.user.isApproved) {
  return res.status(403).json({
    success: false,
    message: 'Your account is not approved by admin.'
  });
}
    const { requestId, price, message, estimatedDays } = req.body;

    // Check if request exists and is open
    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This request is no longer accepting proposals.' });
    }

    // Check for duplicate proposal
    const existing = await Proposal.findOne({ requestId, agencyId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this request.' });
    }

    const proposal = await Proposal.create({
      requestId,
      agencyId: req.user.id,
      price,
      message,
      estimatedDays,
    });

    // Increment proposal count on request
    await ServiceRequest.findByIdAndUpdate(requestId, { $inc: { proposalCount: 1 } });
    // 🔥 CREATE FIRST MESSAGE (VERY IMPORTANT)

const businessId = request.businessId;
const agencyId = proposal.agencyId;

// same logic as messageController
const conversationId = [businessId.toString(), agencyId.toString()]
  .sort()
  .join('_');

await Message.create({
  senderId: businessId,
  receiverId: agencyId,
  conversationId,
  content: "Chat started"
});
    const populated = await proposal.populate('agencyId', 'name email');
    res.status(201).json({ success: true, message: 'Proposal submitted.', proposal: populated });
  } catch (error) {
    console.error('Send proposal error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all proposals for a request
// @route   GET /api/proposals/request/:id
// @access  Private (Business owner of that request)
const getProposalsForRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.businessId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const proposals = await Proposal.find({ requestId: req.params.id })
      .populate('agencyId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get proposals submitted by the logged-in agency
// @route   GET /api/proposals/my
// @access  Private (Agency only)
const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ agencyId: req.user.id })
      .populate('requestId', 'title budget status deadline')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Accept a proposal
// @route   PUT /api/proposals/accept/:id
// @access  Private (Business only)
const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found.' });

    const request = await ServiceRequest.findById(proposal.requestId);
    if (request.businessId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Accept this proposal
    proposal.status = 'accepted';
    await proposal.save();

    // Reject all other proposals for same request
    await Proposal.updateMany(
      { requestId: proposal.requestId, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    // Update request status
    await ServiceRequest.findByIdAndUpdate(proposal.requestId, {
      status: 'in_progress',
      acceptedProposal: proposal._id,
    });

    res.status(200).json({ success: true, message: 'Proposal accepted.', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Reject a proposal
// @route   PUT /api/proposals/reject/:id
// @access  Private (Business only)
const rejectProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found.' });

    const request = await ServiceRequest.findById(proposal.requestId);
    if (request.businessId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.status(200).json({ success: true, message: 'Proposal rejected.', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { sendProposal, getProposalsForRequest, getMyProposals, acceptProposal, rejectProposal };