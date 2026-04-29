require('dotenv').config();
const db = require('../src/db');

async function checkSchema() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clicks';
    `);
    console.log('Clicks table columns:');
    res.rows.forEach(r => console.log('-', r.column_name, r.data_type));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}
checkSchema();
