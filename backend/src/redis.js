const { createClient } = require('redis');

// Only connect to Redis if a URL is explicitly configured.
// In local dev without Redis, we export a safe no-op mock so the app
// boots cleanly and all Redis-dependent features degrade gracefully.
if (!process.env.REDIS_URL) {
  console.log('[Redis] No REDIS_URL set — running without Redis (rate limiting & caching disabled).');
  module.exports = {
    isReady: false,
    get: async () => null,
    setEx: async () => null,
    sendCommand: async () => null,
    on: () => {},
  };
  return; // CommonJS early exit — nothing below runs
}

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.error('[Redis] Max reconnection attempts reached. Disabling Redis.');
        return new Error('Redis max retries exceeded');
      }
      return Math.min(retries * 500, 3000);
    },
  },
});

redis.on('connect', () => console.log('[Redis] Connected'));
redis.on('error', (err) => console.error('[Redis] Error:', err.message));
redis.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

redis.connect().catch((err) => {
  console.warn('[Redis] Initial connection failed:', err.message);
});

module.exports = redis;
