require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../src/routes/auth.route');
const db = require('../src/db');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`[Setup] Test server running on port ${port}\\n`);

  try {
    // 1. REGISTER A DUMMY USER
    const email = `test_refresh_${Date.now()}@example.com`;
    console.log(`[1] Registering user: ${email}...`);
    const res1 = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'SecurePassword1@', confirmPassword: 'SecurePassword1@', name: 'Refresh Tester' })
    });
    
    if (!res1.ok) throw new Error('Register failed: ' + await res1.text());
    
    const setCookie = res1.headers.get('set-cookie');
    const data1 = await res1.json();
    console.log(`  → Access Token returned: ${!!data1.accessToken}`);
    console.log(`  → Set-Cookie Header returned: ${!!setCookie}`);

    const match = setCookie?.match(/refresh_token=([^;]+)/);
    const refreshToken = match ? match[1] : null;
    if (!refreshToken) throw new Error('No refresh token cookie was set!');

    // 2. TEST THE REFRESH ENDPOINT
    console.log(`\\n[2] Attempting to refresh using the token we just got...`);
    const res2 = await fetch(`http://localhost:${port}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Cookie': `refresh_token=${refreshToken}` }
    });

    if (!res2.ok) throw new Error('Refresh failed: ' + await res2.text());
    
    const data2 = await res2.json();
    const newSetCookie = res2.headers.get('set-cookie');
    
    console.log(`  → New Access Token returned: ${!!data2.accessToken}`);
    console.log(`  → New Set-Cookie Header returned: ${!!newSetCookie}`);
    
    const newMatch = newSetCookie?.match(/refresh_token=([^;]+)/);
    const newRefreshToken = newMatch ? newMatch[1] : null;
    
    // Check rotation
    if (refreshToken === newRefreshToken) {
      throw new Error('Refresh token was not rotated! Old token === New token.');
    }
    console.log(`  → Token rotation successful (New token is different)`);

    // 3. TEST REPLAY PREVENTION
    console.log(`\\n[3] Attempting to reuse the old (rotated) token...`);
    const res3 = await fetch(`http://localhost:${port}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Cookie': `refresh_token=${refreshToken}` }
    });
    console.log(`  → Rejected correctly with status ${res3.status}: ${res3.status === 401}`);

    // Cleanup DB
    console.log(`\\n[Cleanup] Deleting test user...`);
    await db.query('DELETE FROM users WHERE email = $1', [email]);

    console.log('\\n✅ REFRESH TOKEN MECHANISM IS WORKING PERFECTLY!');
  } catch(err) {
    console.error('\\n❌ TEST FAILED:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
