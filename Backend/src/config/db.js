// Backend/src/config/db.js
import mongoose from 'mongoose';

// Keep buffering OFF so queries fail fast instead of hanging.
// Safe because server.js awaits connectDB() before handling any request.
mongoose.set('bufferCommands', false);

// Cache the connection across invocations (Vercel serverless reuses warm instances)
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const connectDB = async () => {
  // Already connected and healthy
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        family: 4, // force IPv4
      })
      .then((m) => {
        console.log(`✅ MongoDB Connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow a retry on the next request
        cached.conn = null;
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected');
  cached.conn = null;
  cached.promise = null; // next request will reconnect
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

export default connectDB;