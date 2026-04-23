require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { limiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(limiter);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
const urlRoutes       = require('./routes/url.route');
const analyticsRoutes = require('./routes/analytics.route');
const authRoutes      = require('./routes/auth.route');
const linksRoutes     = require('./routes/links.route');
const ctaRoutes       = require('./routes/cta.route');

app.use('/api/auth',      authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/links',     linksRoutes);
app.use('/api/cta',       ctaRoutes);
app.use('/api',           urlRoutes);    // POST /api/shorten

// Short-code redirect at root level
app.get('/:code', (req, res, next) => {
  const { code } = req.params;
  if (['favicon.ico', 'robots.txt', 'health', 'api'].includes(code)) return next();
  req.url = `/${code}`;
  urlRoutes(req, res, next);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Start
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
