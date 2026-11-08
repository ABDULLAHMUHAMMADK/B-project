// src/routes/depositRoutes.js
import express from 'express';
import { submitManualDeposit } from '../controllers/depositController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProof } from '../middleware/uploadProof.js';

const router = express.Router();

router.post('/submit', protect, uploadProof.single('paymentProof'), submitManualDeposit);

export default router;