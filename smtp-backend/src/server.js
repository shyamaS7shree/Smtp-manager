require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const listsRoutes = require('./routes/lists.routes');
const subscribersRoutes = require('./routes/subscribers.routes');
const campaignsRoutes = require('./routes/campaigns.routes');
const templatesRoutes = require('./routes/templates.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 SMTP Master Backend is running',
    version: '1.0.0',
    database: 'PostgreSQL (Supabase)',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes (all under /api to match MailWizz pattern) ─────────
app.use('/api', authRoutes);
app.use('/api', listsRoutes);
app.use('/api', subscribersRoutes);
app.use('/api', campaignsRoutes);
app.use('/api', templatesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', usersRoutes);

// ── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`✅ SMTP Backend running → http://localhost:${PORT}`);
});

module.exports = app;
