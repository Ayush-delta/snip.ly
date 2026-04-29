const db = require('../src/db');

async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    console.log('1. Adding url_id column...');
    await client.query('ALTER TABLE clicks ADD COLUMN url_id INTEGER');
    
    console.log('2. Populating url_id from urls table...');
    await client.query('UPDATE clicks c SET url_id = u.id FROM urls u WHERE c.short_code = u.short_code');
    
    console.log('3. Deleting orphaned clicks...');
    await client.query('DELETE FROM clicks WHERE url_id IS NULL');
    
    console.log('4. Setting NOT NULL and adding Foreign Key...');
    await client.query('ALTER TABLE clicks ALTER COLUMN url_id SET NOT NULL');
    await client.query('ALTER TABLE clicks ADD CONSTRAINT fk_clicks_url FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE');
    
    console.log('5. Dropping old short_code column...');
    await client.query('ALTER TABLE clicks DROP COLUMN short_code');
    
    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
