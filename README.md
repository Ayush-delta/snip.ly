<div align="center">
  <h1>✂️ Snip.ly</h1>
  <p><b>A modern, high-performance URL shortener with real-time analytics and custom CTA overlays.</b></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Express.js-505050?logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔗 URL Shortening | 6-char nanoid codes or custom aliases |
| ⚡ Redis Cache | Sub-millisecond redirects with 1-hour TTL |
| 📊 Click Analytics | Total clicks, daily trends (30d), countries, devices, browsers |
| 🌍 Geo Tracking | Country detection via geoip-lite |
| 📱 Device Detection | Desktop / mobile / tablet via UA Parser |
| 📷 QR Codes | Auto-generated for every short link |
| 🛡 Rate Limiting | 100 req/min global, 20 req/min for shorten |
| 🐳 Dockerized | 5-service docker-compose stack |
| ⚙️ CI/CD | GitHub Actions → Docker Hub → SSH deploy |
| 🔀 Nginx Proxy | Reverse proxy routing all services |

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
         ├── PostgreSQL :5432  (urls + clicks tables)
         └── Redis :6379       (URL cache, 1h TTL)
```

---

## 📁 Project Structure

```
url-shortener/
├── frontend/                  ← Next.js 14 (App Router, TypeScript)
│   ├── src/app/
│   │   ├── page.tsx           ← Home — shorten form + QR code
│   │   └── dashboard/[code]/  ← Analytics dashboard
│   ├── src/components/
│   │   └── QRCode.tsx
│   └── Dockerfile
│
├── backend/                   ← Express API
│   ├── src/
│   │   ├── index.js           ← App entry
│   │   ├── db.js              ← pg connection pool
│   │   ├── redis.js           ← ioredis client
│   │   ├── routes/
│   │   │   ├── url.js         ← POST /shorten, GET /:code
│   │   │   └── analytics.js   ← GET /analytics/:code
│   │   └── middleware/
│   │       └── rateLimit.js
│   ├── schema.sql
│   └── Dockerfile
│
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── .github/workflows/deploy.yml
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed

### 1. Clone & configure

```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
cp .env.example .env
# Edit .env with your values
```

### 2. Run everything with Docker Compose

```bash
docker compose up --build
```

This starts:
- **Nginx** on `http://localhost:80` (entry point)
- **Next.js frontend** on `:3000`
- **Express backend** on `:5000`
- **PostgreSQL** on `:5432`
- **Redis** on `:6379`

The schema is auto-applied on first PostgreSQL startup.

### 3. Test it

```bash
# Shorten a URL
curl -X POST http://localhost/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'

# Response:
# {"shortUrl":"http://localhost/abc123","code":"abc123","original":"https://github.com"}

# Visit short URL (will redirect)
curl -L http://localhost/abc123

# Get analytics
curl http://localhost/api/analytics/abc123
```

---

## 🔐 Environment Variables

| Variable | Example | Used In |
|---|---|---|
| `DATABASE_URL` | `postgresql://urluser:secret@postgres:5432/urldb` | Backend |
| `REDIS_URL` | `redis://redis:6379` | Backend |
| `BASE_URL` | `https://yourdomain.com` | Backend |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api` | Frontend |
| `POSTGRES_PASSWORD` | `secret` | Docker Compose |
| `DOCKER_USERNAME` | `yourdockerhub` | GitHub Actions |
| `DOCKER_PASSWORD` | *(secret)* | GitHub Actions |
| `SERVER_HOST` | `123.456.789.0` | GitHub Actions |
| `SSH_KEY` | *(private key)* | GitHub Actions |

---

## ⚙️ CI/CD Pipeline

On every push to `main`:

1. **Checkout** repository
2. **Login** to Docker Hub
3. **Build & push** backend image
4. **Build & push** frontend image
5. **SSH deploy** to production VPS:
   - `git pull`
   - `docker compose pull`
   - `docker compose up -d --force-recreate`

Set these **GitHub Secrets** in your repo settings:
`DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SERVER_HOST`, `SSH_KEY`

---

## 📊 API Reference

### `POST /api/shorten`
```json
// Body
{ "url": "https://example.com", "customCode": "my-link" }

// Response 201
{ "shortUrl": "https://yourdomain.com/my-link", "code": "my-link", "original": "..." }
```

### `GET /:code`
Redirects `301` to original URL. Logs click asynchronously.

### `GET /api/analytics/:code`
```json
{
  "code": "abc123",
  "original": "https://...",
  "totalClicks": 42,
  "recentClicks": 7,
  "clicksOverTime": [{ "date": "2024-04-01", "clicks": 5 }, ...],
  "topCountries": [{ "country": "US", "count": 20 }, ...],
  "deviceBreakdown": [{ "device": "desktop", "count": 35 }, ...],
  "browserBreakdown": [{ "browser": "Chrome", "count": 28 }, ...]
}
```

### `GET /health`
```json
{ "status": "ok", "timestamp": "..." }
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, QRCode.react |
| Backend | Node.js, Express 4, nanoid, geoip-lite, ua-parser-js |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| DevOps | Docker, docker-compose, Nginx |
| CI/CD | GitHub Actions, Docker Hub, SSH deploy |


