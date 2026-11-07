const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
      index: true,
    },
    facilityName: { type: String, required: true },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    timeSlot: {
      type: String,
      required: true,
      validate: {
        validator: (value) => ['Morning', 'Afternoon', 'Evening'].includes(value) || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
        message: 'Select a valid facility time slot.',
      },
    },
    schedulePeriod: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], default: null },
    purpose: { type: String, required: true, trim: true, maxlength: 500 },
    guestCount: { type: Number, min: 1, max: 200, default: 1 },
    feeCentavos: { type: Number, required: true, min: 0 },
    feeDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    adminNote: { type: String, trim: true, maxlength: 2000, default: '' },
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

reservationSchema.index(
  { facility: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Approved' },
    name: 'one_approved_reservation_per_facility_slot',
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
