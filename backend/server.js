require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5001;

// Allow one or more comma-separated origins via CORS_ORIGIN in .env
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler (catches anything thrown/passed to next())
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Finance tracker API running on http://localhost:${PORT}`);
  });
});
