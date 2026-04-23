const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const db = require('../db');
const { signAccessToken } = require('../middleware/auth');

const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Check duplicate
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email.toLowerCase(), hash, name || null]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = await createSession(user.id);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (err) {
    console.error('[POST /auth/register]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

//  POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await db.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = await createSession(user.id);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    });
  } catch (err) {
    console.error('[POST /auth/login]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token.' });
    }

    const result = await db.query(
      `SELECT rt.user_id, u.email, u.name
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      res.clearCookie('refresh_token', { path: '/api/auth' });
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const { user_id, email, name } = result.rows[0];

    // Rotate: delete old token, create new one
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    const { accessToken, refreshToken } = await createSession(user_id);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
    return res.json({
      user: { id: user_id, email, name },
      accessToken,
    });
  } catch (err) {
    console.error('[POST /auth/refresh]', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]).catch(() => {});
  }
  res.clearCookie('refresh_token', { path: '/api/auth' });
  return res.json({ message: 'Logged out.' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const { requireAuth } = require('../middleware/auth');
  requireAuth(req, res, async () => {
    const result = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.rows[0] });
  });
});

// Helper: create session (access token + refresh token)
async function createSession(userId) {
  const userRow = await db.query('SELECT id, email FROM users WHERE id = $1', [userId]);
  const user = userRow.rows[0];

  const accessToken = signAccessToken(user);
  const refreshToken = nanoid(64);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, refreshToken, expiresAt]
  );

  return { accessToken, refreshToken };
}

module.exports = router;
