// models/AgencyProfile.js - Extended profile for agency users
const mongoose = require('mongoose');

const agencyProfileSchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    agencyName: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    services: {
      type: [String],
      required: [true, 'At least one service is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    workersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    portfolio: {
      type: [String], // URLs to portfolio items
      default: [],
    },
    gstNumber: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AgencyProfile', agencyProfileSchema);
