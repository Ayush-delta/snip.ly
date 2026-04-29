const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../redis');

// node-redis v4: sendCommand takes an array of strings (not spread args)
// rate-limit-redis calls sendCommand(...args) so we wrap into array form.
function makeRedisStore(prefix) {
  return new RedisStore({
    prefix,
    sendCommand: (...args) => redis.sendCommand(args),
  });
}

// Helper: check if Redis is ready before using the store
const isRedisReady = () => redis.isReady;

// Global limiter — 100 req/min per IP on all routes
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again in a minute.' },
  keyGenerator: (req) => req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip,
  store: makeRedisStore('rl:global:'),
  skip: () => !isRedisReady(), // degrade to no-op if Redis is down
});

// Strict limiter — 20 req/min per IP on POST /api/shorten
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many shorten requests. Limit: 20 per minute.' },
  keyGenerator: (req) => req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip,
  store: makeRedisStore('rl:shorten:'),
  skip: () => !isRedisReady(), // degrade to no-op if Redis is down
});

module.exports = { limiter, shortenLimiter };
