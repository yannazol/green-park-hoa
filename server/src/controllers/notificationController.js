const mongoose = require('mongoose');
const Notification = require('../models/Notification');

exports.listMine = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ resident: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ resident: req.user._id, readAt: null }),
    ]);
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Could not load resident notifications:', error.message);
    return res.status(500).json({ message: 'Could not load notifications' });
  }
};

exports.markRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, resident: req.user._id, readAt: null },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) {
      const existing = await Notification.exists({ _id: req.params.id, resident: req.user._id });
      if (!existing) return res.status(404).json({ message: 'Notification not found' });
    }
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Could not update resident notification:', error.message);
    return res.status(500).json({ message: 'Could not update notification' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { resident: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return res.json({ updated: result.modifiedCount });
  } catch (error) {
    console.error('Could not mark resident notifications read:', error.message);
    return res.status(500).json({ message: 'Could not update notifications' });
  }
};
