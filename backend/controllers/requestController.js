// controllers/requestController.js - Service request CRUD operations
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Create a new service request
// @route   POST /api/requests/create
// @access  Private (Business only)
const createRequest = async (req, res) => {
  try {
    const { title, description, budget, deadline, category, location } = req.body;

    const request = await ServiceRequest.create({
      businessId: req.user.id,
      title,
      description,
      budget,
      deadline,
      category,
      location,
    });

    res.status(201).json({ success: true, message: 'Service request created.', request });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all open service requests (for agencies to browse)
// @route   GET /api/requests
// @access  Private
const getAllRequests = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};

    // Businesses see their own; agencies see open ones
    if (req.user.role === 'business') {
      query.businessId = req.user.id;
    } else if (req.user.role === 'agency') {
      query.status = status || 'open';
    }

    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ServiceRequest.countDocuments(query);
    const requests = await ServiceRequest.find(query)
      .populate('businessId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      pages: Math.ceil(total / limit),
      requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single service request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('businessId', 'name email phone')
      .populate('acceptedProposal');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a service request
// @route   PUT /api/requests/:id
// @access  Private (Business owner only)
const updateRequest = async (req, res) => {
  try {
    let request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.businessId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    request = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Request updated.', request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a service request
// @route   DELETE /api/requests/:id
// @access  Private (Business owner only)
const deleteRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.businessId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await request.deleteOne();
    res.status(200).json({ success: true, message: 'Request deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createRequest, getAllRequests, getRequestById, updateRequest, deleteRequest };
