// Backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import mongoose from 'mongoose';

import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import depositRoutes from './src/routes/depositRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import withdrawalRoutes from './src/routes/withdrawalRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import referralRoutes from './src/routes/referralRoutes.js';
import errorHandler from './src/middleware/errorHandler.js';
import { initYieldCron } from './src/jobs/yieldCron.js';
import stripeTestRoutes from './src/routes/stripeTestRoutes.js';
import { handleStripeTestWebhook } from './src/controllers/stripeTestWebhookController.js';

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// 1. Universal Dynamic CORS Handling
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// 2. Database Connection Middleware Guard
// Prevents requests from buffering for 10 seconds if network dropped
app.use((req, res, next) => {
  // Skip check for healthcheck & webhooks
  if (req.path === '/' || req.path.includes('/webhooks')) return next();

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'Database connection reconnecting. Please try again in a few seconds.',
    });
  }
  next();
});

// 3. Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 4. Stripe Webhook Route
app.post(
  '/api/test-stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeTestWebhook
);

// 5. Express Body Parser
app.use(express.json({ limit: '10kb' }));

// 6. Custom NoSQL Injection Sanitizer
app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  next();
});

// 7. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: 'Too many auth attempts. Try again in 15 mins.' },
});

app.use('/api', generalLimiter);

// 9. Mount API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/test-stripe', stripeTestRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send({ status: 'API is running securely...' });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Initialize Daily Yield Cron Scheduler
initYieldCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;