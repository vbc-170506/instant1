// models/Proposal.js - Agency proposals for service requests
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    message: {
      type: String,
      required: [true, 'Proposal message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated completion days is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One agency can only send one proposal per request
proposalSchema.index({ requestId: 1, agencyId: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
