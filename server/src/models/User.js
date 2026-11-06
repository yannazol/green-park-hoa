const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'resident'], default: 'resident' },
    unit: { type: String, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    residentType: { type: String, enum: ['homeowner', 'tenant'] },
    isActive: { type: Boolean, default: true },
    accessCodeHash: { type: String, select: false },
    accessCodeExpires: { type: Date, select: false },
    accessCodeAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);