const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plateNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 16 },
    makeModel: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: ['Car', 'Motorcycle', 'SUV', 'Van'], required: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ resident: 1, plateNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
