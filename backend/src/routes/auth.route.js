const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const crypto = require('crypto');
const db = require('../db');
const { signAccessToken, requireAuth } = require('../middleware/auth');
const { validate } = require('../validators/validate');
const { registerSchema, loginSchema, ForgotPasswordSchema, ResetPasswordSchema } = require('../validators/auth.validator');
const { sendPasswordResetEmail } = require('../services/email');

// SHA-256 hash of the token — only the hash is stored in DB.
// The plaintext token travels to the client via httpOnly cookie.
// If DB is breached, attackers get useless hashes.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}


const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    // req.body is already cleaned and normalized by Zod at this point
    const { email, password, name } = req.body;

    // Check duplicate
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hash, name || null]
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
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    // req.body.email is already trimmed + lowercased by Zod
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
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

    // Query by hash — plaintext token from cookie is hashed before lookup
    const result = await db.query(
      `SELECT rt.user_id, u.email, u.name
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [hashToken(token)]
    );

    if (result.rows.length === 0) {
      res.clearCookie('refresh_token', { path: '/api/auth' });
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const { user_id, email, name } = result.rows[0];

    // Rotate: delete old hash, create new session
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [hashToken(token)]);
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
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [hashToken(token)]).catch(() => {});
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
    [userId, hashToken(refreshToken), expiresAt]  // store hash, return plaintext
  );

  return { accessToken, refreshToken }; // plaintext token goes to cookie
}

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', validate(ForgotPasswordSchema, 'body'), async (req, res) => {
  const { email } = req.body;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // Always return a generic success message to prevent email enumeration
    const successMessage = { message: 'If that email exists, a reset link was sent.' };

    if (userRes.rows.length === 0) {
      return res.status(200).json(successMessage);
    }

    const userId = userRes.rows[0].id;

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );

    // Provide the frontend URL. In dev it falls back to localhost:3000
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    await sendPasswordResetEmail(email, resetToken, frontendUrl);

    res.status(200).json(successMessage);
  } catch (error) {
    console.error('[POST /forgot-password]', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
router.post('/reset-password', validate(ResetPasswordSchema, 'body'), async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const tokenRes = await db.query(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const userId = tokenRes.rows[0].user_id;

    // Hash new password
    const newPasswordHash = await bcrypt.hash(password, 12);

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Update password
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);
      
      // Delete used reset token
      await client.query('DELETE FROM password_reset_tokens WHERE token_hash = $1', [tokenHash]);
      
      // Security: Revoke all active refresh tokens for this user so they are signed out everywhere
      await client.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Also clear current session cookies just to be completely clean
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
    });

    res.status(200).json({ message: 'Password has been successfully reset. Please log in.' });
  } catch (error) {
    console.error('[POST /reset-password]', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
