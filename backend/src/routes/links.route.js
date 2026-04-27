const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../validators/validate');
const { shortCodeParamSchema } = require('../validators/url.validator');

// ─── GET /api/links — all links for authenticated user ────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         u.short_code,
         u.original,
         u.created_at,
         u.expires_at,
         COUNT(c.id)::int AS click_count,
         EXISTS(SELECT 1 FROM ctas ct WHERE ct.short_code = u.short_code AND ct.enabled = true) AS has_cta
       FROM urls u
       LEFT JOIN clicks c ON c.short_code = u.short_code
       WHERE u.user_id = $1
       GROUP BY u.short_code, u.original, u.created_at, u.expires_at
       ORDER BY u.created_at DESC`,
      [req.user.id]
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const links = result.rows.map((r) => ({
      ...r,
      shortUrl: `${baseUrl}/${r.short_code}`,
    }));

    return res.json({ links });
  } catch (err) {
    console.error('[GET /api/links]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── DELETE /api/links/:code ───────────────────────────────────────────────────────────
router.delete('/:code', requireAuth, validate(shortCodeParamSchema, 'params'), async (req, res) => {
  try {
    const { code } = req.params;

    // Verify ownership
    const check = await db.query(
      'SELECT id FROM urls WHERE short_code = $1 AND user_id = $2',
      [code, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found or not yours.' });
    }

    await db.query('DELETE FROM urls WHERE short_code = $1', [code]);
    return res.json({ message: 'Link deleted.' });
  } catch (err) {
    console.error('[DELETE /api/links/:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
