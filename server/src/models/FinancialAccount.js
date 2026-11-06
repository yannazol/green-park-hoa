const mongoose = require('mongoose');

const financialAccountSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    outstandingCentavos: { type: Number, default: 0, min: 0 },
    collectedCentavos: { type: Number, default: 0, min: 0 },
    creditCentavos: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialAccount', financialAccountSchema);
