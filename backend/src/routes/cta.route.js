const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../validators/validate');
const { createCtaSchema } = require('../validators/cta.validator');
const { shortCodeParamSchema } = require('../validators/url.validator');

// GET /api/cta/:code
router.get('/:code', optionalAuth, validate(shortCodeParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM ctas WHERE short_code = $1',
      [req.params.code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No CTA configured for this link.' });
    }
    res.json({ cta: result.rows[0] });
  } catch (err) {
    console.error('[GET /api/cta/:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/cta — create or update CTA for a link
router.post('/', requireAuth, validate(createCtaSchema), async (req, res) => {
  try {
    // All fields are validated, trimmed, and have defaults applied by Zod
    const {
      shortCode,
      message,
      buttonText,
      buttonUrl,
      position,
      bgColor,
      textColor,
      btnColor,
      enabled,
    } = req.body;

    // Verify ownership of the URL
    const urlCheck = await db.query(
      'SELECT id FROM urls WHERE short_code = $1 AND user_id = $2',
      [shortCode, req.user.id]
    );
    if (urlCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You do not own this link.' });
    }

    // Upsert CTA
    const result = await db.query(
      `INSERT INTO ctas
         (short_code, user_id, message, button_text, button_url, position, bg_color, text_color, btn_color, enabled, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (short_code) DO UPDATE SET
         message     = EXCLUDED.message,
         button_text = EXCLUDED.button_text,
         button_url  = EXCLUDED.button_url,
         position    = EXCLUDED.position,
         bg_color    = EXCLUDED.bg_color,
         text_color  = EXCLUDED.text_color,
         btn_color   = EXCLUDED.btn_color,
         enabled     = EXCLUDED.enabled,
         updated_at  = NOW()
       RETURNING *`,
      [shortCode, req.user.id, message, buttonText, buttonUrl, position, bgColor, textColor, btnColor, enabled]
    );

    res.status(201).json({ cta: result.rows[0] });
  } catch (err) {
    console.error('[POST /api/cta]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/cta/:code — remove CTA
router.delete('/:code', requireAuth, validate(shortCodeParamSchema, 'params'), async (req, res) => {
  try {
    const check = await db.query(
      'SELECT id FROM ctas WHERE short_code = $1 AND user_id = $2',
      [req.params.code, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'CTA not found or not yours.' });
    }
    await db.query('DELETE FROM ctas WHERE short_code = $1', [req.params.code]);
    res.json({ message: 'CTA removed.' });
  } catch (err) {
    console.error('[DELETE /api/cta/:code]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
