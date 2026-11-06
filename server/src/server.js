require('dotenv').config();
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
const app = require('./app');

const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');
const MonthlyCharge = require('./models/MonthlyCharge');
const DueEntry = require('./models/DueEntry');
const FinancialAccount = require('./models/FinancialAccount');
const Payment = require('./models/Payment');
const Facility = require('./models/Facility');
const Reservation = require('./models/Reservation');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const Vehicle = require('./models/Vehicle');
const GateEntryFee = require('./models/GateEntryFee');
const SeniorAssistance = require('./models/SeniorAssistance');
const { ensureDefaultFacilities } = require('./utils/defaultFacilities');

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([
      MonthlyCharge.init(),
      DueEntry.init(),
      FinancialAccount.init(),
      Payment.init(),
      Facility.init(),
      Reservation.init(),
      Announcement.init(),
      Notification.init(),
      Vehicle.init(),
      GateEntryFee.init(),
      SeniorAssistance.init(),
    ]);
    await ensureDefaultFacilities();
    console.log('MongoDB connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

start();