require('dotenv').config();
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
const app = require('./app');

const PORT = process.env.PORT || 5000;

const mongoose = require('mongoose');

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
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