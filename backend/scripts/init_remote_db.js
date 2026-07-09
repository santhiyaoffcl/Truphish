// backend/scripts/init_remote_db.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initRemoteDb() {
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'truphish_db';

  if (!dbHost || !dbUser) {
    console.error('❌ Error: DB_HOST and DB_USER environment variables must be defined.');
    console.log('Please set them in your backend/.env file first.');
    process.exit(1);
  }

  console.log(`Connecting to remote database host: ${dbHost}...`);

  try {
    // Connect without DB first to ensure DB exists or create it
    const conn = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      multipleStatements: true
    });

    console.log(`Creating database "${dbName}" if it does not exist...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    await conn.query(`USE ${dbName};`);

    console.log('Reading mysql_init.sql...');
    const sqlPath = path.join(__dirname, '..', 'mysql_init.sql');
    const sqlFile = fs.readFileSync(sqlPath, 'utf8');

    // Split statements by semicolon
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('Executing database initialization statements...');
    for (const stmt of statements) {
      if (
        stmt.toUpperCase().startsWith('CREATE TABLE') ||
        stmt.toUpperCase().startsWith('USE') ||
        stmt.toUpperCase().startsWith('CREATE DATABASE')
      ) {
        // Replace database name reference in sql file if any to use the configured DB_NAME
        const queryStr = stmt.replace(/truphish_db/g, dbName);
        console.log(`Executing: ${queryStr.substring(0, 60)}...`);
        await conn.query(queryStr);
      }
    }

    console.log('✅ Remote Database and tables initialized successfully!');
    await conn.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initRemoteDb();
