// src/controllers/withdrawalController.js
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { sendEmail } from '../services/emailService.js';
import { withdrawalRequestedTemplate } from '../utils/emailTemplates.js';
import {
  WITHDRAWAL_GRACE_PERIOD_HOURS,
  WITHDRAWAL_LOCK_PROFIT_TARGET,
  WITHDRAWAL_FEE_PERCENTAGE,
} from '../config/constants.js';

// @desc    Submit Cashout/Withdrawal Request (Sends to Admin Pending Queue)
// @route   POST /api/withdrawals/request
// @access  Private
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, binancePayId } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Please specify a valid withdrawal amount' });
    }

    if (!binancePayId) {
      return res.status(400).json({ success: false, error: 'Please provide your Binance Pay ID for receiving payout' });
    }

    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet record not found' });
    }

    // Check for prior withdrawal requests
    const priorWithdrawalCount = await Transaction.countDocuments({
      user: req.user._id,
      type: 'WITHDRAWAL_REQUEST',
    });

    // 1. Initial Grace Period Evaluation
    let isInGracePeriod = false;
    if (user.firstDepositAt) {
      const hoursElapsed = (new Date() - new Date(user.firstDepositAt)) / (1000 * 60 * 60);

      if (!user.hasUsedGracePeriod && priorWithdrawalCount === 0 && hoursElapsed < WITHDRAWAL_GRACE_PERIOD_HOURS) {
        isInGracePeriod = true;
      } else if (!user.hasUsedGracePeriod && hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS) {
        user.hasUsedGracePeriod = true;
        await user.save();
      }
    }

    // 2. Profit Lock Check ($50 unwithdrawn profit required)
    const profitTargetMet = wallet.unwithdrawnProfitCounter >= WITHDRAWAL_LOCK_PROFIT_TARGET;
    const canWithdraw = isInGracePeriod || profitTargetMet;

    if (!canWithdraw) {
      return res.status(400).json({
        success: false,
        error: `Withdrawal locked. You must generate at least $${WITHDRAWAL_LOCK_PROFIT_TARGET} USDT in new yield/referral profits since your last cashout to unlock withdrawals. Current accumulated profit: $${wallet.unwithdrawnProfitCounter.toFixed(2)} USDT.`,
      });
    }

    const withdrawAmount = Number(amount);
    const totalAvailable = wallet.profitBalance + wallet.referralBalance + wallet.mainBalance;

    if (withdrawAmount > totalAvailable) {
      return res.status(400).json({
        success: false,
        error: `Insufficient total balance. Available balance: $${totalAvailable.toFixed(2)} USDT.`,
      });
    }

    // Calculate 20% platform fee
    const feeDeducted = withdrawAmount * WITHDRAWAL_FEE_PERCENTAGE;
    const netAmount = withdrawAmount - feeDeducted;

    // Update target Binance Pay ID
    wallet.binancePayId = binancePayId;
    await wallet.save();

    // Create PENDING transaction entry (NO wallet balance deducted yet)
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'WITHDRAWAL_REQUEST',
      amount: withdrawAmount,
      feeDeducted,
      netAmount,
      status: 'PENDING',
      description: `Pending withdrawal request to Binance Pay ID: ${binancePayId}`,
    });

    // Send confirmation email
    sendEmail({
      to: user.email,
      subject: 'Withdrawal Request Submitted - TradeYield',
      html: withdrawalRequestedTemplate(user.name, withdrawAmount, feeDeducted, netAmount, binancePayId),
    }).catch((err) => console.error('Withdrawal request email error:', err.message));

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted for Admin review',
      data: {
        transaction,
        walletStatus: {
          mainBalance: wallet.mainBalance,
          profitBalance: wallet.profitBalance,
          referralBalance: wallet.referralBalance,
          unwithdrawnProfitCounter: wallet.unwithdrawnProfitCounter,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};