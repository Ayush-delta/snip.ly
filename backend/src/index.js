require('dotenv').config();

// ── Global unhandled rejection handler ─────────────────────────────────────────
// node-redis throws an AggregateError when reconnectStrategy gives up.
// We catch it here so Redis being unavailable never kills the process.
// All other unhandled rejections still crash the server (correct behavior).
process.on('unhandledRejection', (err) => {
  const isRedisError =
    err?.code === 'ECONNREFUSED' ||
    (err instanceof AggregateError && err.errors?.some((e) => e.code === 'ECONNREFUSED'));

  if (isRedisError) {
    console.error('[Redis] Connection ultimately failed — running without Redis.');
    return; // suppress: app continues without Redis
  }

  // All other unhandled rejections are real bugs → crash and let nodemon/PM2 restart
  console.error('[FATAL] Unhandled rejection:', err);
  process.exit(1);
});

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const cookieParser = require('cookie-parser');
const db         = require('./db');
const { limiter } = require('./middleware/rateLimit');
const { PORT, FRONTEND_URL, NODE_ENV } = require('./config');

const app = express();

// ── Security headers (helmet) ──────────────────────────────────────────────────
// Sets X-Frame-Options, X-Content-Type-Options, HSTS, CSP, Referrer-Policy etc.
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────────
// FRONTEND_URL is enforced by config.js — it crashes loudly in production
// if the var is missing rather than silently blocking all real users.
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ────────────────────────────────────────────────────────────────
// 10kb cap — prevents request body flooding attacks
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.set('trust proxy', 1);

// ── Global rate limiter ─────────────────────────────────────────────────────────
app.use(limiter);

// ── Health ──────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────────
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

// ── 404 ─────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────────────────────────────
// MUST have 4 arguments — Express identifies error handlers by arity.
// Catches any error passed to next(err) or thrown in async middleware.
// In production: never expose stack traces to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
  });
});

// ── Startup ──────────────────────────────────────────────────────────────────────
// Verify DB connection before accepting traffic — fail fast if misconfigured.
async function start() {
  await db.query('SELECT 1');
  console.log('[DB] Connection verified');
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT} (${NODE_ENV})`);
  });
}

start().catch((err) => {
  console.error('[Startup] FATAL:', err.message);
  process.exit(1);
});

