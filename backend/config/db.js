const mongoose = require('mongoose');
const dns = require('dns');

// Force public DNS resolvers to handle SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truphish';

console.log(`🔍 Connecting to MongoDB...`);

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB successfully.'))
  .catch(err => console.error('❌ MongoDB Connection Failed:', err.message));

module.exports = mongoose.connection;