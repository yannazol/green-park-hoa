const mongoose = require('mongoose');

const facilityPhotoSchema = new mongoose.Schema(
  {
    mimeType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
    data: { type: String, required: true },
    name: { type: String, maxlength: 160, default: '' },
  },
  { _id: false }
);

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    feeCentavos: { type: Number, required: true, min: 0 },
    feeDescription: { type: String, required: true },
    photo: { type: facilityPhotoSchema, default: null },
    operatingHours: {
      opensAt: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
      closesAt: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
      slotMinutes: { type: Number, enum: [60], default: 60 },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
