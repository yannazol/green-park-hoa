const Notification = require('../models/Notification');
const User = require('../models/User');

async function createNotification(notification) {
  try {
    await Notification.create(notification);
    return true;
  } catch (error) {
    console.error('Could not create resident notification:', error.message);
    return false;
  }
}

async function notifyResidents(notification) {
  try {
    const residents = await User.find({ role: 'resident', isActive: { $ne: false } }).select('_id').lean();
    if (residents.length === 0) return true;
    await Notification.insertMany(
      residents.map(({ _id }) => ({ ...notification, resident: _id })),
      { ordered: false }
    );
    return true;
  } catch (error) {
    console.error('Could not notify residents:', error.message);
    return false;
  }
}

module.exports = { createNotification, notifyResidents };
