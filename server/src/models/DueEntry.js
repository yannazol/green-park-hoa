const mongoose = require('mongoose');

const dueEntrySchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    charge: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthlyCharge', required: true },
    month: { type: String, required: true },
    amountCentavos: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

dueEntrySchema.index({ resident: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('DueEntry', dueEntrySchema);
