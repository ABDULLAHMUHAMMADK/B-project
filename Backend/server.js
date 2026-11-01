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

const app = express();
const isVercel = process.env.VERCEL === '1';

app.set('trust proxy', 1);

/* ------------------------------ CORS ------------------------------ */
// Comma-separated list in env, e.g.
// CLIENT_URLS=https://your-frontend.vercel.app,https://yourdomain.com,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URLS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // No origin = server-to-server (Stripe webhooks), curl, Postman
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false); // not allowed: no CORS headers are sent
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400,
};

// cors() also answers OPTIONS preflight requests automatically
app.use(cors(corsOptions));

/* ---------------------------- Security ---------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* --------------------------- Health check -------------------------- */
// Placed before the DB middleware so it works even if the DB is down
app.get('/', (req, res) => {
  res.send({ status: 'API is running securely...' });
});

/* ------------------- Ensure DB is connected first ------------------ */
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again.',
    });
  }
});

/* ------------------------ Stripe raw webhook ----------------------- */
// Must come BEFORE express.json()
app.post(
  '/api/test-stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeTestWebhook
);

/* ---------------------------- Body parsing ------------------------- */
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  next();
});

app.use(hpp());

/* --------------------------- Rate limiting ------------------------- */
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

/* ------------------------------ Routes ----------------------------- */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/test-stripe', stripeTestRoutes);

app.use(errorHandler);

/* ------------------------ Start (non-serverless) ------------------- */
// On Vercel the platform handles listening; cron jobs don't run reliably there.
if (!isVercel) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      initYieldCron(); // only start cron once the DB is ready, on a persistent server
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}

export default app;