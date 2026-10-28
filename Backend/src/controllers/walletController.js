// src/controllers/walletController.js
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import {
  MINIMUM_INITIAL_DEPOSIT,
  WITHDRAWAL_GRACE_PERIOD_HOURS,
  WITHDRAWAL_LOCK_PROFIT_TARGET,
  WITHDRAWAL_FEE_PERCENTAGE,
} from '../config/constants.js';

export const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopUpInfo = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    const currentBalance = wallet ? wallet.mainBalance : 0;

    let minRequiredDeposit = MINIMUM_INITIAL_DEPOSIT;

    if (currentBalance > 0 && currentBalance < MINIMUM_INITIAL_DEPOSIT) {
      minRequiredDeposit = MINIMUM_INITIAL_DEPOSIT - currentBalance;
    } else if (currentBalance >= MINIMUM_INITIAL_DEPOSIT) {
      minRequiredDeposit = 1;
    }

    res.status(200).json({
      success: true,
      data: {
        currentMainBalance: currentBalance,
        minimumRequiredThreshold: MINIMUM_INITIAL_DEPOSIT,
        minRequiredDeposit,
        isThresholdMet: currentBalance >= MINIMUM_INITIAL_DEPOSIT,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get withdrawal eligibility status, grace period state, and fee breakdown
// @route   GET /api/wallet/withdraw-info
// @access  Private
export const getWithdrawalInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    const priorWithdrawalCount = await Transaction.countDocuments({
      user: req.user._id,
      type: 'WITHDRAWAL_REQUEST',
    });

    let isInGracePeriod = false;
    let hoursRemainingInGrace = 0;

    if (user.firstDepositAt) {
      const now = new Date();
      const firstDepositTime = new Date(user.firstDepositAt);
      const hoursElapsed = (now - firstDepositTime) / (1000 * 60 * 60);

      // Grace period is active ONLY if hasUsedGracePeriod is false, prior withdrawals === 0, and hours elapsed < threshold
      if (!user.hasUsedGracePeriod && priorWithdrawalCount === 0 && hoursElapsed < WITHDRAWAL_GRACE_PERIOD_HOURS) {
        isInGracePeriod = true;
        hoursRemainingInGrace = Math.max(0, WITHDRAWAL_GRACE_PERIOD_HOURS - hoursElapsed).toFixed(4);
      } else if (!user.hasUsedGracePeriod && hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS) {
        // Auto-expire grace period flag in database if time limit exceeded
        user.hasUsedGracePeriod = true;
        await user.save();
      }
    }

    // Profit lock check ($50 unwithdrawn profit required once grace period is over)
    const profitTargetMet = wallet.unwithdrawnProfitCounter >= WITHDRAWAL_LOCK_PROFIT_TARGET;
    const canWithdraw = isInGracePeriod || profitTargetMet;

    res.status(200).json({
      success: true,
      data: {
        mainBalance: wallet.mainBalance,
        profitBalance: wallet.profitBalance,
        unwithdrawnProfitCounter: wallet.unwithdrawnProfitCounter,
        referralBalance: wallet.referralBalance,
        binancePayId: wallet.binancePayId,
        withdrawalRules: {
          hasUsedGracePeriod: user.hasUsedGracePeriod || priorWithdrawalCount > 0,
          isInGracePeriod,
          hoursRemainingInGrace,
          profitLockTarget: WITHDRAWAL_LOCK_PROFIT_TARGET,
          profitTargetMet,
          canWithdraw,
          platformFeePercentage: WITHDRAWAL_FEE_PERCENTAGE * 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};