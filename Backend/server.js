import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import walletRoutes from './src/routes/walletRoutes.js';
import depositRoutes from './src/routes/depositRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import withdrawalRoutes from './src/routes/withdrawalRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import referralRoutes from './src/routes/referralRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import errorHandler from './src/middleware/errorHandler.js';
import { initYieldCron } from './src/jobs/yieldCron.js';
import stripeTestRoutes from './src/routes/stripeTestRoutes.js';
import { handleStripeTestWebhook } from './src/controllers/stripeTestWebhookController.js';

dotenv.config();

connectDB();

const app = express();
app.set('trust proxy', 1);

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

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.post(
  '/api/test-stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeTestWebhook
);

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  next();
});

app.use(hpp());

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
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/test-stripe', stripeTestRoutes);

app.get('/', (req, res) => {
  res.send({ status: 'API is running securely...' });
});

app.use(errorHandler);

initYieldCron();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;