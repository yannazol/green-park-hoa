const mongoose = require('mongoose');

const verificationEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['approved', 'rejected'], required: true },
    note: { type: String, trim: true, maxlength: 1000, default: '' },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amountCentavos: { type: Number, required: true, min: 1 },
    referenceNumber: { type: String, required: true, trim: true, uppercase: true },
    receiptData: { type: Buffer, required: true, select: false },
    receiptMimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp'],
      select: false,
    },
    receiptFileName: { type: String, required: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, trim: true, maxlength: 1000, default: '' },
    verificationHistory: { type: [verificationEntrySchema], default: [] },
  },
  { timestamps: true }
);

paymentSchema.index({ referenceNumber: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
