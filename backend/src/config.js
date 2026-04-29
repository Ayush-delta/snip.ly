/**
 * src/config.js — Central environment config with startup enforcement.
 *
 * WHY: If a required secret is missing (deploy mistake, missing .env),
 * the server should CRASH immediately with a clear message rather than
 * silently running with a hardcoded fallback that anyone can exploit.
 *
 * Usage: const { JWT_SECRET, DATABASE_URL } = require('./config');
 */

function requireEnv(name) {
  const val = process.env[name];
  if (!val || val.trim() === '') {
    throw new Error(
      `[Config] FATAL: Missing required environment variable "${name}". ` +
      `Set it in your .env file or deployment environment and restart.`
    );
  }
  return val;
}

// In development, fall back gracefully. In production, enforce strictly.
function requireEnvInProd(name, devFallback) {
  if (process.env.NODE_ENV === 'production') {
    return requireEnv(name);
  }
  return process.env[name] || devFallback;
}

module.exports = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  // In production JWT_SECRET MUST be set — a missing/hardcoded secret means
  // any attacker can forge valid tokens for any user.
  JWT_SECRET: requireEnvInProd('JWT_SECRET', 'dev-secret-change-in-production'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',

  // ── Database ─────────────────────────────────────────────────────────────────
  DATABASE_URL: requireEnv('DATABASE_URL'),

  // ── Redis ────────────────────────────────────────────────────────────────────
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // ── Server ───────────────────────────────────────────────────────────────────
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // ── CORS ─────────────────────────────────────────────────────────────────────
  // In production, FRONTEND_URL must be set — falling back to localhost:3000
  // in prod would silently block all real users.
  FRONTEND_URL: requireEnvInProd('FRONTEND_URL', 'http://localhost:3000'),

  // ── Tokens ───────────────────────────────────────────────────────────────────
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10),
};
