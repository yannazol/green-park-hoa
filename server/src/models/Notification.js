const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['concern', 'payment', 'reservation', 'announcement', 'service'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    path: { type: String, required: true, maxlength: 160 },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ resident: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
