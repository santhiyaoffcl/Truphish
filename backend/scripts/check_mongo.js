// backend/scripts/check_mongo.js
const mongoose = require('mongoose');
const dns = require('dns');

// Force public DNS resolvers to handle SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const User = require('../models/user');
const ScanHistory = require('../models/scanHistory');

async function checkDatabaseStorage() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truphish';

  console.log(`🔍 Connecting to MongoDB: ${mongoURI}...`);

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected successfully!');

    // Check users collection
    const usersCount = await User.countDocuments();
    console.log(`👤 Users stored: ${usersCount}`);

    // Check scan_history collection
    const scansCount = await ScanHistory.countDocuments();
    console.log(`📊 Scans stored: ${scansCount}`);

    if (usersCount > 0) {
      console.log('\n--- Recent 5 Users ---');
      const recentUsers = await User.find()
        .sort({ created_at: -1 })
        .limit(5)
        .select('id email username role created_at');
      
      const tableData = recentUsers.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        role: u.role,
        created_at: u.created_at
      }));
      console.table(tableData);
    }

    if (scansCount > 0) {
      console.log('\n--- Recent 5 Scans ---');
      const recentScans = await ScanHistory.find()
        .sort({ created_at: -1 })
        .limit(5);

      const tableData = recentScans.map(s => ({
        id: s.id,
        user_id: s.user_id,
        input: s.input.length > 50 ? s.input.substring(0, 50) + '...' : s.input,
        type: s.type,
        risk_score: s.risk_score,
        prediction: s.prediction,
        created_at: s.created_at
      }));
      console.table(tableData);
    }

  } catch (error) {
    console.error('❌ Error reading database:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabaseStorage();
