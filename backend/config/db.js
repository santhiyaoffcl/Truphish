const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'truphish_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully.');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  }
}

testConnection();

module.exports = pool;