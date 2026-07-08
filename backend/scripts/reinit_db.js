const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function reinit() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: ''
    });

    console.log('Dropping existing truphish_db...');
    await conn.query('DROP DATABASE IF EXISTS truphish_db;');
    
    console.log('Re-creating truphish_db...');
    await conn.query('CREATE DATABASE truphish_db;');
    await conn.query('USE truphish_db;');

    const sqlFile = fs.readFileSync(path.join(__dirname, '..', 'mysql_init.sql'), 'utf8');
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('CREATE TABLE') || stmt.toUpperCase().startsWith('CREATE DATABASE') || stmt.toUpperCase().startsWith('USE')) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        await conn.query(stmt);
      }
    }

    console.log('✅ Database and tables re-initialized successfully.');
    await conn.end();
  } catch (error) {
    console.error('❌ Re-initialization failed:', error);
  }
}

reinit();
