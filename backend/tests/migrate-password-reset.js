const db = require('../src/db');

async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Creating password_reset_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_tokens(token_hash);
    `);
    
    await client.query('COMMIT');
    console.log('Migration successful: password_reset_tokens table created!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
