// backend/scripts/check_db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseStorage() {
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'truphish_db';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const sslEnabled = process.env.DB_SSL === 'true';

  console.log(`🔍 Connecting to DB: ${dbHost}:${dbPort}/${dbName}...`);

  try {
    const conn = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
    });

    console.log('✅ Connected successfully!');

    // Check users table
    const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
    console.log(`👤 Users stored: ${users[0].count}`);

    // Check scan_history table
    const [scans] = await conn.query('SELECT COUNT(*) as count FROM scan_history');
    console.log(`📊 Scans stored: ${scans[0].count}`);

    if (users[0].count > 0) {
      console.log('\n--- Recent 5 Users ---');
      const [recentUsers] = await conn.query('SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
      console.table(recentUsers);
    }

    if (scans[0].count > 0) {
      console.log('\n--- Recent 5 Scans ---');
      const [recentScans] = await conn.query('SELECT id, user_id, input, type, risk_score, prediction, created_at FROM scan_history ORDER BY created_at DESC LIMIT 5');
      console.table(recentScans);
    }

    await conn.end();
  } catch (error) {
    console.error('❌ Error reading database:', error.message);
  }
}

checkDatabaseStorage();
