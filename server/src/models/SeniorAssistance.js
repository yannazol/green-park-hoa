const mongoose = require('mongoose');

const seniorAssistanceSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true, maxlength: 80 },
    details: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['Pending', 'In progress', 'Done', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    adminNote: { type: String, trim: true, maxlength: 1000, default: '' },
    statusHistory: {
      type: [
        new mongoose.Schema(
          {
            status: { type: String, required: true },
            note: { type: String, default: '' },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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

module.exports = mongoose.model('SeniorAssistance', seniorAssistanceSchema);
