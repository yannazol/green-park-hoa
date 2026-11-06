const mongoose = require('mongoose');

const concernSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['complaint', 'suggestion', 'inquiry'], required: true },
    category: {
      type: String,
      enum: [
        'parking',
        'security',
        'noise',
        'roads',
        'street lights',
        'garbage',
        'landscaping',
        'common facilities',
        'other',
      ],
      required: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
      index: true,
    },
    staffNote: { type: String, trim: true, maxlength: 1000, default: '' },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photos: { type: [String], default: [] },
    statusHistory: {
      type: [
        new mongoose.Schema(
          {
            status: { type: String, required: true },
            note: { type: String, default: '' },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Concern', concernSchema);