const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const concernRoutes = require('./routes/concernRoutes');
const duesRoutes = require('./routes/duesRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

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

module.exports = app;