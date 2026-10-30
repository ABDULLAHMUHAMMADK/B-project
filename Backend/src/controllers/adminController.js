// src/controllers/adminController.js
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import { MINIMUM_INITIAL_DEPOSIT } from '../config/constants.js';

// @desc    Get system-wide financial overview, platform fees, & user investment deficits
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const wallets = await Wallet.find({}).populate('user', 'name email createdAt role');

    // Financial Metrics
    const totalLiquidity = wallets.reduce((acc, w) => acc + (w.mainBalance || 0), 0);
    const totalProfitBalances = wallets.reduce((acc, w) => acc + (w.profitBalance || 0), 0);
    const totalReferralBalances = wallets.reduce((acc, w) => acc + (w.referralBalance || 0), 0);
    const totalWithdrawableBalance = totalLiquidity + totalProfitBalances + totalReferralBalances;

    // Revenue Metrics: Sum of all 20% platform fees collected on approved cashouts
    const completedWithdrawals = await Transaction.find({
      type: 'WITHDRAWAL_REQUEST',
      status: 'COMPLETED',
    });
    const totalPlatformFeesCollected = completedWithdrawals.reduce(
      (acc, t) => acc + (t.feeDeducted || 0),
      0
    );

    // User Segmentation & Threshold Deficit Calculations
    let fullyInvestedCount = 0; // >= $300
    let partiallyInvestedCount = 0; // > $0 and < $300
    let zeroInvestedCount = 0; // $0

    const userInvestmentDetails = [];

    for (const w of wallets) {
      if (!w.user || w.user.role === 'admin') continue;

      const mainBal = w.mainBalance || 0;
      let status = 'UNINVESTED';
      let remainingToMinThreshold = MINIMUM_INITIAL_DEPOSIT;

      if (mainBal >= MINIMUM_INITIAL_DEPOSIT) {
        status = 'ACTIVE_QUALIFIED';
        remainingToMinThreshold = 0;
        fullyInvestedCount++;
      } else if (mainBal > 0) {
        status = 'BELOW_THRESHOLD';
        remainingToMinThreshold = MINIMUM_INITIAL_DEPOSIT - mainBal;
        partiallyInvestedCount++;
      } else {
        zeroInvestedCount++;
      }

      userInvestmentDetails.push({
        userId: w.user._id,
        name: w.user.name,
        email: w.user.email,
        mainBalance: mainBal,
        totalWithdrawable: mainBal + (w.profitBalance || 0) + (w.referralBalance || 0),
        status,
        remainingToMinThreshold,
      });
    }

    const pendingWithdrawalsCount = await Transaction.countDocuments({
      type: 'WITHDRAWAL_REQUEST',
      status: 'PENDING',
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalLiquidity,
          totalWithdrawableBalance,
          totalPlatformFeesCollected,
          pendingWithdrawalsCount,
          segmentation: {
            fullyInvestedCount,
            partiallyInvestedCount,
            zeroInvestedCount,
          },
        },
        userInvestmentDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of all pending withdrawal cashout requests
// @route   GET /api/admin/withdrawals/pending
// @access  Private/Admin
export const getPendingWithdrawals = async (req, res, next) => {
  try {
    const pendingWithdrawals = await Transaction.find({ type: 'WITHDRAWAL_REQUEST', status: 'PENDING' })
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: pendingWithdrawals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process/Complete or Reject a withdrawal payout request
// @route   PUT /api/admin/withdrawals/:id/action
// @access  Private/Admin
export const processWithdrawalAction = async (req, res, next) => {
  try {
    const { action, payoutTxHash } = req.body;
    const transactionId = req.params.id;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, error: "Action must be 'APPROVE' or 'REJECT'" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.type !== 'WITHDRAWAL_REQUEST') {
      return res.status(404).json({ success: false, error: 'Pending withdrawal transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Transaction already ${transaction.status.toLowerCase()}` });
    }

    const wallet = await Wallet.findOne({ user: transaction.user });
    const user = await User.findById(transaction.user);

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'User wallet record not found' });
    }

    if (action === 'REJECT') {
      transaction.status = 'REJECTED';
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: 'Withdrawal request rejected. No funds deducted.',
        data: transaction,
      });
    }

    // Action === 'APPROVE'
    const withdrawAmount = transaction.amount;
    const totalAvailable = wallet.profitBalance + wallet.referralBalance + wallet.mainBalance;

    if (withdrawAmount > totalAvailable) {
      return res.status(400).json({
        success: false,
        error: `Insufficient user balance at time of approval. Total available: $${totalAvailable.toFixed(2)} USDT`,
      });
    }

    // Deduct requested amount: Profit Balance -> Referral Balance -> Main Balance
    let remainingToDeduct = withdrawAmount;

    if (wallet.profitBalance >= remainingToDeduct) {
      wallet.profitBalance -= remainingToDeduct;
      remainingToDeduct = 0;
    } else {
      remainingToDeduct -= wallet.profitBalance;
      wallet.profitBalance = 0;
    }

    if (remainingToDeduct > 0 && wallet.referralBalance >= remainingToDeduct) {
      wallet.referralBalance -= remainingToDeduct;
      remainingToDeduct = 0;
    } else if (remainingToDeduct > 0) {
      remainingToDeduct -= wallet.referralBalance;
      wallet.referralBalance = 0;
    }

    if (remainingToDeduct > 0) {
      wallet.mainBalance -= remainingToDeduct;
    }

    // Reset lock counter and timestamp cashout approval
    wallet.unwithdrawnProfitCounter = 0;
    wallet.lastWithdrawalAt = new Date();

    if (user && !user.hasUsedGracePeriod) {
      user.hasUsedGracePeriod = true;
      await user.save();
    }

    await wallet.save();

    transaction.status = 'COMPLETED';
    if (payoutTxHash) {
      transaction.txHash = payoutTxHash;
    }
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal approved, funds deducted from user wallet, and payout marked completed',
      data: {
        transaction,
        updatedWallet: {
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