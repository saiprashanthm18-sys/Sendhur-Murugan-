const mongoose = require('mongoose');

const connectDB = async (retries = 3, delay = 1000) => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!process.env.MONGO_URI) {
        console.warn('⚠️ MONGO_URI environment variable not set');
        return;
      }
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('⚠️ Could not connect to MongoDB. Proceeding in degraded mode.');
      }
    }
  }
};

module.exports = connectDB;
