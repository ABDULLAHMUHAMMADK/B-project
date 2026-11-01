// Backend/src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Disable Mongoose buffering so queries fail or retry instantly instead of hanging for 10s
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout connection attempt after 5 seconds
      socketTimeoutMS: 45000,
      family: 4,                       // Force IPv4 to prevent stale DNS lookups
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('🔄 Retrying MongoDB connection in 3 seconds...');
    setTimeout(connectDB, 3000);
  }
};

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