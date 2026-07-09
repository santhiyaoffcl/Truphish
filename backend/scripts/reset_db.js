// backend/scripts/reset_db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDb() {
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'truphish_db';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const sslEnabled = process.env.DB_SSL === 'true';

  console.log(`⚠️ Warning: Resetting database tables in ${dbHost}:${dbPort}/${dbName}...`);

  try {
    const conn = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined
    });

    console.log('🗑️ Dropping existing tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('DROP TABLE IF EXISTS scan_history;');
    await conn.query('DROP TABLE IF EXISTS users;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Tables dropped successfully.');

    console.log('🔄 Re-running table initialization...');
    const initScript = require('./init_remote_db.js'); // This will execute init_remote_db.js code

    await conn.end();
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  }
}

resetDb();
