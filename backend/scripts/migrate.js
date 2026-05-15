const db = require('../config/db');

async function migrate() {
  try {
    console.log('Adding "username" column to "users" table...');
    // We use directly because this DB connection already works.
    await db.query('ALTER TABLE users ADD COLUMN username VARCHAR(255) AFTER email;');
    console.log('✅ Migration successful: "username" column added.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('✅ Column "username" already exists. Skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    // Note: Pooled connections don't need manual close here but we can exit
    process.exit(0);
  }
}

migrate();
