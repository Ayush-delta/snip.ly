const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../validators/validate');
const { shortCodeParamSchema } = require('../validators/url.validator');

// GET /api/analytics/:code
// Requires auth — only the link owner can view analytics for their link.
router.get('/:code', requireAuth, validate(shortCodeParamSchema, 'params'), async (req, res) => {
  const { code } = req.params;

  try {
    // Verify the link exists AND belongs to the authenticated user
    const urlResult = await db.query(
      'SELECT id, original, created_at FROM urls WHERE short_code = $1 AND user_id = $2',
      [code, req.user.id]
    );

    if (urlResult.rows.length === 0) {
      // Return 404 regardless of whether the code exists — avoids leaking
      // whether a short code belongs to another user.
      return res.status(404).json({ error: 'Short URL not found or not yours.' });
    }

    const { id: urlId, original, created_at } = urlResult.rows[0];

    // Run all 5 analytics queries in parallel — no sequential waiting
    const [
      totalResult,
      dailyResult,
      countriesResult,
      devicesResult,
      browsersResult,
      recentResult,
    ] = await Promise.all([
      // Total clicks
      db.query('SELECT COUNT(*) AS total FROM clicks WHERE url_id = $1', [urlId]),

      // Clicks per day — last 30 days
      db.query(
        `SELECT
           DATE(clicked_at AT TIME ZONE 'UTC') AS date,
           COUNT(*) AS clicks
         FROM clicks
         WHERE url_id = $1
           AND clicked_at >= NOW() - INTERVAL '30 days'
         GROUP BY date
         ORDER BY date ASC`,
        [urlId]
      ),

      // Top 5 countries
      db.query(
        `SELECT country, COUNT(*) AS count
         FROM clicks
         WHERE url_id = $1
         GROUP BY country
         ORDER BY count DESC
         LIMIT 5`,
        [urlId]
      ),

      // Device breakdown
      db.query(
        `SELECT
           COALESCE(NULLIF(device, ''), 'desktop') AS device,
           COUNT(*) AS count
         FROM clicks
         WHERE url_id = $1
         GROUP BY device`,
        [urlId]
      ),

      // Browser breakdown
      db.query(
        `SELECT browser, COUNT(*) AS count
         FROM clicks
         WHERE url_id = $1
           AND browser != 'Unknown'
         GROUP BY browser
         ORDER BY count DESC
         LIMIT 5`,
        [urlId]
      ),

      // Clicks last 24h
      db.query(
        `SELECT COUNT(*) AS recent
         FROM clicks
         WHERE url_id = $1
           AND clicked_at >= NOW() - INTERVAL '24 hours'`,
        [urlId]
      ),
    ]);

    return res.json({
      code,
      original,
      createdAt: created_at,
      totalClicks:  parseInt(totalResult.rows[0].total, 10),
      recentClicks: parseInt(recentResult.rows[0].recent, 10),
      clicksOverTime: dailyResult.rows.map((r) => ({
        date:   r.date,
        clicks: parseInt(r.clicks, 10),
      })),
      topCountries: countriesResult.rows.map((r) => ({
        country: r.country,
        count:   parseInt(r.count, 10),
      })),
      deviceBreakdown: devicesResult.rows.map((r) => ({
        device: r.device,
        count:  parseInt(r.count, 10),
      })),
      browserBreakdown: browsersResult.rows.map((r) => ({
        browser: r.browser,
        count:   parseInt(r.count, 10),
      })),
    });
  } catch (err) {
    console.error('[GET /analytics/:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
