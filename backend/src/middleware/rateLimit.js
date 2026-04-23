const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again in a minute.',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
});

const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // stricter limit for shorten endpoint
  message: {
    error: 'Too many shorten requests. Limit: 20 per minute.',
  },
});

module.exports = { limiter, shortenLimiter };
