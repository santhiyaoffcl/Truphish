const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'truphish_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

async function testAndInitConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully.');
    
    // Check if users table exists
    const [rows] = await connection.query("SHOW TABLES LIKE 'users'");
    if (rows.length === 0) {
      console.log('🔄 Database tables not found. Initializing database schema...');
      const sqlPath = path.join(__dirname, '..', 'mysql_init.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlFile = fs.readFileSync(sqlPath, 'utf8');
        const statements = sqlFile
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const stmt of statements) {
          if (
            stmt.toUpperCase().startsWith('CREATE TABLE') ||
            stmt.toUpperCase().startsWith('USE') ||
            stmt.toUpperCase().startsWith('CREATE DATABASE')
          ) {
            await connection.query(stmt);
          }
        }
        console.log('✅ Database schema initialized successfully.');
      } else {
        console.error('⚠️ Could not find mysql_init.sql at', sqlPath);
      }
    } else {
      console.log('ℹ️ Database tables already exist.');
    }
    
    connection.release();
  } catch (err) {
    console.error('❌ MySQL Connection/Initialization Failed:', err.message);
  }
}

testAndInitConnection();

module.exports = pool;