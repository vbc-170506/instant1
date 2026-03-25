// controllers/adminController.js - Admin management
const User = require('../models/User');
const AgencyProfile = require('../models/AgencyProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');

// @desc    Get all agencies (with approval status)
// @route   GET /api/admin/agencies
// @access  Admin only
const getAllAgencies = async (req, res) => {
  try {
    const { status } = req.query; // 'approved' | 'pending'
    const query = { role: 'agency' };
    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;

    const agencies = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach agency profiles
    const result = await Promise.all(
      agencies.map(async (agency) => {
        const profile = await AgencyProfile.findOne({ agencyId: agency._id });
        return { ...agency.toObject(), profile };
      })
    );

    res.status(200).json({ success: true, count: result.length, agencies: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Approve an agency
// @route   PUT /api/admin/agencies/approve/:id
// @access  Admin only
const approveAgency = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role !== 'agency') return res.status(400).json({ success: false, message: 'User is not an agency.' });

    user.isApproved = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Agency approved successfully.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Reject / revoke an agency
// @route   PUT /api/admin/agencies/reject/:id
// @access  Admin only
const rejectAgency = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isApproved = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Agency rejected/revoked.', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get platform stats for admin overview
// @route   GET /api/admin/stats
// @access  Admin only
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAgencies, pendingAgencies, totalRequests, totalPayments] = await Promise.all([
      User.countDocuments({ role: 'business' }),
      User.countDocuments({ role: 'agency' }),
      User.countDocuments({ role: 'agency', isApproved: false }),
      ServiceRequest.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalAgencies, pendingAgencies, totalRequests, totalPayments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllAgencies, approveAgency, rejectAgency, getStats, getAllUsers };