const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    mimeType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
    data: { type: String, required: true },
    name: { type: String, maxlength: 160, default: '' },
  },
  { _id: false }
);

const historySchema = new mongoose.Schema(
  {
    action: { type: String, required: true, maxlength: 80 },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, required: true, maxlength: 100 },
    at: { type: Date, default: Date.now },
    details: { type: String, maxlength: 500, default: '' },
  },
  { _id: false }
);

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: {
      type: String,
      enum: ['Notice', 'Maintenance', 'Reminder', 'Fees'],
      required: true,
      default: 'Notice',
      index: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 10000 },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Published', 'Archived'],
      default: 'Published',
      index: true,
    },
    date: { type: Date, default: Date.now, index: true },
    publishAt: { type: Date, default: null, index: true },
    publishedAt: { type: Date, default: null, index: true },
    images: { type: [imageSchema], default: [] },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true, collection: 'announcements' }
);

announcementSchema.index({ status: 1, publishAt: 1 });
announcementSchema.index({ status: 1, publishedAt: -1, date: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
