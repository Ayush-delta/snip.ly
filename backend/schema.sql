-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- URLs table
CREATE TABLE IF NOT EXISTS urls (
  id          SERIAL PRIMARY KEY,
  original    TEXT NOT NULL,
  short_code  VARCHAR(10) UNIQUE NOT NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_ip     VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

-- Clicks analytics table
CREATE TABLE IF NOT EXISTS clicks (
  id          SERIAL PRIMARY KEY,
  url_id      INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ DEFAULT NOW(),
  country     VARCHAR(100),
  device      VARCHAR(50),
  browser     VARCHAR(50),
  referrer    TEXT,
  ip          VARCHAR(50)
);

-- Refresh tokens (one row per active session)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CTA overlay configs (one per short_code)
CREATE TABLE IF NOT EXISTS ctas (
  id           SERIAL PRIMARY KEY,
  short_code   VARCHAR(10) REFERENCES urls(short_code) ON DELETE CASCADE UNIQUE,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  button_text  VARCHAR(80) DEFAULT 'Visit Us',
  button_url   TEXT,
  position     VARCHAR(20) DEFAULT 'bottom-left',
  bg_color     VARCHAR(20) DEFAULT '#1a1a26',
  text_color   VARCHAR(20) DEFAULT '#e8e8f0',
  btn_color    VARCHAR(20) DEFAULT '#00e5ff',
  enabled      BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_urls_short_code   ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id      ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_url_id      ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens    ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_ctas_short_code   ON ctas(short_code);
