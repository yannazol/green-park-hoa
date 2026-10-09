require('dotenv').config();
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const users = [
  { name: 'HOA Admin', email: 'admin@greenpark.test', password: 'Admin123!', role: 'admin' },
  { name: 'HOA Staff', email: 'staff@greenpark.test', password: 'Staff123!', role: 'staff' },
  { name: 'Juan Dela Cruz', email: 'resident@greenpark.test', password: 'Resident123!', role: 'resident', unit: 'Block 1 Lot 1' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.findOneAndUpdate(
        { email: u.email },
        { ...u, password: hashed },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`Seeded ${u.role}: ${u.email}`);
    }

    console.log('Seeding done');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();