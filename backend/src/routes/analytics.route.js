const express = require('express');
const router = express.Router();
const db = require('../db');
const { validate } = require('../validators/validate');
const { shortCodeParamSchema } = require('../validators/url.validator');

// GET /api/analytics/:code
router.get('/:code', validate(shortCodeParamSchema, 'params'), async (req, res) => {
  const { code } = req.params;

  try {
    // Check URL exists
    const urlResult = await db.query(
      'SELECT original, created_at FROM urls WHERE short_code = $1',
      [code]
    );

    if (urlResult.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found.' });
    }

    const { original, created_at } = urlResult.rows[0];

    // Total clicks
    const totalResult = await db.query(
      'SELECT COUNT(*) AS total FROM clicks WHERE short_code = $1',
      [code]
    );
    const totalClicks = parseInt(totalResult.rows[0].total, 10);

    // Clicks per day — last 30 days
    const dailyResult = await db.query(
      `SELECT
         DATE(clicked_at AT TIME ZONE 'UTC') AS date,
         COUNT(*) AS clicks
       FROM clicks
       WHERE short_code = $1
         AND clicked_at >= NOW() - INTERVAL '30 days'
       GROUP BY date
       ORDER BY date ASC`,
      [code]
    );

    // Top 5 countries
    const countriesResult = await db.query(
      `SELECT country, COUNT(*) AS count
       FROM clicks
       WHERE short_code = $1
       GROUP BY country
       ORDER BY count DESC
       LIMIT 5`,
      [code]
    );

    // Device breakdown
    const devicesResult = await db.query(
      `SELECT
         COALESCE(NULLIF(device, ''), 'desktop') AS device,
         COUNT(*) AS count
       FROM clicks
       WHERE short_code = $1
       GROUP BY device`,
      [code]
    );

    // Browser breakdown
    const browsersResult = await db.query(
      `SELECT browser, COUNT(*) AS count
       FROM clicks
       WHERE short_code = $1
         AND browser != 'Unknown'
       GROUP BY browser
       ORDER BY count DESC
       LIMIT 5`,
      [code]
    );

    // Clicks last 24h
    const recentResult = await db.query(
      `SELECT COUNT(*) AS recent
       FROM clicks
       WHERE short_code = $1
         AND clicked_at >= NOW() - INTERVAL '24 hours'`,
      [code]
    );
    const recentClicks = parseInt(recentResult.rows[0].recent, 10);

    return res.json({
      code,
      original,
      createdAt: created_at,
      totalClicks,
      recentClicks,
      clicksOverTime: dailyResult.rows.map((r) => ({
        date: r.date,
        clicks: parseInt(r.clicks, 10),
      })),
      topCountries: countriesResult.rows.map((r) => ({
        country: r.country,
        count: parseInt(r.count, 10),
      })),
      deviceBreakdown: devicesResult.rows.map((r) => ({
        device: r.device,
        count: parseInt(r.count, 10),
      })),
      browserBreakdown: browsersResult.rows.map((r) => ({
        browser: r.browser,
        count: parseInt(r.count, 10),
      })),
    });
  } catch (err) {
    console.error('[GET /analytics/:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
