const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const generateShortCode = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 5);
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const db = require('../db');
const redis = require('../redis');
const { shortenLimiter } = require('../middleware/rateLimit');
const { optionalAuth } = require('../middleware/auth');
const { buildOverlayHTML } = require('../services/ctaOverlay');
const { validate } = require('../validators/validate');
const { shortenSchema, shortCodeParamSchema } = require('../validators/url.validator');

// POST /api/shorten
router.post('/shorten', shortenLimiter, optionalAuth, validate(shortenSchema), async (req, res) => {
  try {
    // req.body.url is already validated (https/http only) and trimmed by Zod
    const { url, customCode } = req.body;

    const code = customCode || generateShortCode();

    if (customCode) {
      const existing = await db.query(
        'SELECT short_code FROM urls WHERE short_code = $1',
        [code]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Custom code already taken.' });
      }
    }

    const userIp =
      req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const userId = req.user?.id || null;

    await db.query(
      'INSERT INTO urls (original, short_code, user_ip, user_id) VALUES ($1, $2, $3, $4)',
      [url, code, userIp, userId]
    );

    const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
    return res.status(201).json({
      shortUrl: `${baseUrl}/${code}`,
      code,
      original: url,
    });
  } catch (err) {
    console.error('[POST /shorten]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /:code — CTA overlay or 301 redirect
router.get('/:code', validate(shortCodeParamSchema, 'params'), async (req, res) => {
  const { code } = req.params;

  try {
    // Helper functions to gracefully fallback if Redis is down
    const safeRedisGet = async (k) => { try { return await redis.get(k); } catch (e) { return null; } };
    const safeRedisSetex = async (k, t, v) => { try { await redis.setex(k, t, v); } catch (e) {} };

    // 1. Try Redis cache for URL and CTA
    let original = await safeRedisGet(`url:${code}`);
    let ctaCache = await safeRedisGet(`cta:${code}`); // 'no' | JSON string | null
    let ctaData = null;

    if (!original) {
      const result = await db.query(
        'SELECT original, expires_at FROM urls WHERE short_code = $1',
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Short URL not found.' });
      }

      const row = result.rows[0];

      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        return res.status(410).json({ error: 'This short URL has expired.' });
      }

      original = row.original;
      await safeRedisSetex(`url:${code}`, 3600, original);
    }

    // 2. Check for CTA (cached or DB)
    if (ctaCache === null) {
      const ctaResult = await db.query(
        'SELECT * FROM ctas WHERE short_code = $1 AND enabled = true',
        [code]
      );
      if (ctaResult.rows.length > 0) {
        ctaData = ctaResult.rows[0];
        await safeRedisSetex(`cta:${code}`, 3600, JSON.stringify(ctaData));
      } else {
        await safeRedisSetex(`cta:${code}`, 300, 'no'); 
      }
    } else if (ctaCache !== 'no') {
      try { ctaData = JSON.parse(ctaCache); } catch { ctaData = null; }
    }

    // 3. Log click asynchronously
    logClick(code, req).catch((err) => console.error('[logClick]', err.message));

    // 4. Serve CTA overlay or redirect
    if (ctaData) {
      const html = buildOverlayHTML({ original, cta: ctaData });
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    return res.redirect(301, original);
  } catch (err) {
    console.error('[GET /:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Helper: log click
async function logClick(shortCode, req) {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const referrer = req.headers['referer'] || '';

  const geo = geoip.lookup(ip);
  const country = geo?.country || 'Unknown';

  const parser = new UAParser(ua);
  const device = parser.getDevice().type || 'desktop';
  const browser = parser.getBrowser().name || 'Unknown';

  await db.query(
    `INSERT INTO clicks (short_code, country, device, browser, referrer, ip)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [shortCode, country, device, browser, referrer, ip]
  );
}

module.exports = router;
