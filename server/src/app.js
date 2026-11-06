const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const concernRoutes = require('./routes/concernRoutes');
const duesRoutes = require('./routes/duesRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const residentRoutes = require('./routes/residentRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Green Park HOA API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/concerns', concernRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/community', communityRoutes);

module.exports = app;