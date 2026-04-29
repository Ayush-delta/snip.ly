<div align="center">
  <h1>✂️ Snip.ly</h1>
  <p><b>A production-hardened, full-stack URL shortener with real-time analytics, custom CTA overlays, and enterprise-grade security.</b></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Express.js-505050?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/Zod-Validated-6E56CF?logo=zod&logoColor=white" alt="Zod" />
    <img src="https://img.shields.io/badge/Security-Hardened-2ed573?logo=shield&logoColor=white" alt="Security" />
  </p>
</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔗 URL Shortening | 6-char nanoid codes or custom aliases |
| ⚡ Redis Cache | Sub-millisecond redirects with 1-hour TTL (graceful degradation if Redis unavailable) |
| 📊 Click Analytics | Total clicks, daily trends (30d), countries, devices, browsers — owner-only |
| 🌍 Geo Tracking | Country detection via geoip-lite |
| 📱 Device Detection | Desktop / mobile / tablet via UA Parser |
| 📷 QR Codes | Auto-generated for every short link |
| 🛡 Rate Limiting | Redis-backed: 100 req/min global, 20 req/min for shorten |
| 🔐 JWT Auth | 15-minute access tokens + 30-day rotating refresh tokens (SHA-256 hashed in DB) |
| 📧 Password Reset | Secure 15-minute reset tokens via Resend email (console simulation in dev) |
| 🎯 CTA Overlays | Custom call-to-action banners overlaid on shortened links |
| 🐳 Dockerized | 5-service docker-compose stack |
| ⚙️ CI/CD | GitHub Actions → Docker Hub → SSH deploy |
| 🔀 Nginx Proxy | Reverse proxy routing all services |

---

## 🔒 Security Architecture

Snip.ly has been audited and hardened against industry-standard vulnerability categories:

| # | Vulnerability | Mitigation |
|---|---|---|
| 1 | Input Injection (SQLi, XSS) | Zod validation on all endpoints (`422` on failure) + parameterized SQL |
| 2 | Missing Secrets | `config.js` crashes at startup in production if `JWT_SECRET` / `DATABASE_URL` are unset |
| 3 | IDOR / Broken Access Control | Analytics routes require auth + `WHERE user_id = req.user.id` ownership check |
| 4 | XSS in CTA Overlay | Custom `escapeHtml()` sanitizes all user input before HTML injection |
| 5 | Unhandled Errors | 4-arg global Express error handler — stack traces never exposed in production |
| 6 | Missing Security Headers | `helmet()` — sets HSTS, X-Frame-Options, CSP, X-Content-Type-Options |
| 7 | Brute-Force / DoS | Redis-backed rate limiting (degrades gracefully to no-op without Redis) |
| 8 | Plaintext Refresh Tokens | Only SHA-256 hashes stored in DB; plaintext travels via `httpOnly` cookie only |
| 9 | Hardcoded CORS | `FRONTEND_URL` enforced from env; crashes loudly in production if unset |
| 10 | Fragile DB Schema | `clicks` table migrated to `url_id` FK (INTEGER) from string `short_code` |
| 11 | Request Body Flooding | `express.json({ limit: '10kb' })` |
| 12 | DB Misconfiguration | Startup `SELECT 1` health check — server refuses to boot if DB is unreachable |
| 13 | Weak Passwords | 6-rule `PasswordSchema` (Zod): length 8–72, upper, lower, digit, 21 special chars |
| 14 | Password Reset Abuse | 15-min expiry tokens, SHA-256 hashed, deleted after use, all sessions revoked on reset |

---

## 🏗 Architecture

```
Browser
  │
  ▼
Nginx :80
  ├── /api/*       → Express Backend :5000
  ├── /[a-z]{4,12} → Express Backend :5000 (redirect)
  └── /*           → Next.js Frontend :3000
         │
         ├── PostgreSQL (Neon)   — urls, clicks, refresh_tokens, password_reset_tokens
         └── Redis :6379         — URL cache (1h TTL) + rate-limit counters
```

---

## 📁 Project Structure

```
snip.ly/
├── frontend/                         ← Next.js 15 (App Router, TypeScript)
│   └── src/
│       ├── app/
│       │   ├── page.tsx              ← Home — shorten form + QR code
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx     ← Live password strength meter + complexity rules
│       │   ├── forgot-password/      ← Request password reset
│       │   ├── reset-password/       ← Set new password (strength meter reused)
│       │   └── dashboard/[code]/     ← Analytics dashboard
│       └── contexts/AuthContext.tsx  ← JWT + refresh token management
│
├── backend/                          ← Express API
│   └── src/
│       ├── index.js                  ← Entry: helmet, CORS, rate limiter, global error handler
│       ├── config.js                 ← Env validation — crashes in production if secrets missing
│       ├── db.js                     ← pg Pool with startup health check
│       ├── redis.js                  ← node-redis client (graceful no-op if unavailable)
│       ├── routes/
│       │   ├── auth.route.js         ← Register, login, refresh, logout, forgot/reset password
│       │   ├── url.route.js          ← POST /shorten, GET /:code (redirect + CTA)
│       │   ├── analytics.route.js    ← GET /analytics/:code (auth + ownership enforced)
│       │   ├── links.route.js        ← Link management
│       │   └── cta.route.js          ← CTA overlay CRUD
│       ├── middleware/
│       │   ├── auth.js               ← JWT verification middleware
│       │   └── rateLimit.js          ← Redis-backed limiters
│       ├── validators/               ← Zod schemas (auth, url, cta)
│       └── services/
│           ├── email.js              ← Resend email (console simulation in dev)
│           └── ctaOverlay.js         ← HTML builder with escapeHtml() XSS protection
│
├── docker-compose.yml                ← Redis + Backend + Frontend + Nginx
├── nginx.conf
└── .env.example
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local Redis)

### 1. Clone & configure

```bash
git clone https://github.com/Ayush-delta/snip.ly.git
cd snip.ly
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, FRONTEND_URL
```

### 2. Start Redis locally

```bash
# Spin up only the Redis container (no need to run the full stack)
docker compose up -d redis
```

### 3. Run backend

```bash
cd backend
npm install
npm run dev
# Expected output:
# [Redis] Connected
# [DB] Connection verified
# [Server] Running on http://localhost:5000 (development)
```

### 4. Run frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

> **No Redis?** The app runs fine without it. Rate limiting and URL caching are automatically disabled. Remove `REDIS_URL` from `.env` to skip the connection entirely.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Always | PostgreSQL connection string (`sslmode=verify-full` recommended) |
| `JWT_SECRET` | ✅ Production | Secret for signing JWTs — server refuses to start in prod if missing |
| `FRONTEND_URL` | ✅ Production | Allowed CORS origin — e.g. `https://yourdomain.com` |
| `REDIS_URL` | ⚠️ Optional | Redis connection string. Omit to run without Redis |
| `RESEND_API_KEY` | ⚠️ Optional | Resend API key for password reset emails. Omit to use console simulation |
| `PORT` | Optional | Defaults to `5000` |
| `NODE_ENV` | Optional | `development` or `production` |
| `JWT_EXPIRES_IN` | Optional | Defaults to `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Optional | Defaults to `30` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Always | Backend API base URL — e.g. `http://localhost:5000/api` |

---

## 📊 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register (email, password, confirmPassword, name) |
| `POST` | `/api/auth/login` | — | Login → returns access token + sets refresh cookie |
| `POST` | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| `POST` | `/api/auth/logout` | Cookie | Invalidate refresh token |
| `POST` | `/api/auth/forgot-password` | — | Send password reset email |
| `POST` | `/api/auth/reset-password` | — | Reset password with token (revokes all sessions) |

### URLs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/shorten` | Optional | Shorten a URL |
| `GET` | `/:code` | — | Redirect to original URL (logs click, serves CTA if set) |
| `GET` | `/api/links` | ✅ | List all links for authenticated user |
| `DELETE` | `/api/links/:code` | ✅ | Delete a link |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/analytics/:code` | ✅ | Full analytics for a link (owner only) |

### Health

```bash
GET /health
# { "status": "ok", "timestamp": "..." }
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Recharts, QRCode.react |
| Backend | Node.js, Express 4, nanoid, geoip-lite, ua-parser-js |
| Validation | Zod (server + mirrored client-side rules) |
| Database | PostgreSQL 15 (Neon) |
| Cache & Rate Limiting | Redis 7 (node-redis) |
| Auth | JWT (jsonwebtoken) + bcryptjs + rotating refresh tokens |
| Email | Resend |
| Security | helmet, express-rate-limit, SHA-256 token hashing |
| DevOps | Docker, docker-compose, Nginx |
| CI/CD | GitHub Actions, Docker Hub, SSH deploy |
