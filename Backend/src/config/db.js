// Backend/src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of waiting indefinitely
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not crash process immediately if testing locally, or retry connection
  }
};

// Log Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB Atlas!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose runtime error:', err.message);
});

export default connectDB;