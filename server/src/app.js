const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const concernRoutes = require('./routes/concernRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Green Park HOA API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/concerns', concernRoutes);

module.exports = app;