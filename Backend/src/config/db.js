// Backend/src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // 1. Disable buffering so queries fail or reconnect fast instead of hanging requests for 10s
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Stop waiting after 5s if Atlas isn't reachable
      socketTimeoutMS: 45000,          // Close inactive sockets after 45s
      family: 4,                       // Force IPv4 to avoid stale IPv6 DNS lookup delays on new Wi-Fi
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

// Mongoose Connection Event Monitoring
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected! Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB Atlas!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

export default connectDB;