const mongoose = require('mongoose');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
