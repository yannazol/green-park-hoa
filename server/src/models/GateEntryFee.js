const mongoose = require('mongoose');

const gateEntryFeeSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, maxlength: 100, unique: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    amountCentavos: { type: Number, required: true, min: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GateEntryFee', gateEntryFeeSchema);
