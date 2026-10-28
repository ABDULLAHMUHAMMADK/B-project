// src/controllers/adminController.js
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import { MINIMUM_INITIAL_DEPOSIT } from '../config/constants.js';
import { sendEmail } from '../services/emailService.js';
import { depositApprovedTemplate } from '../utils/emailTemplates.js';

// @desc    Get system-wide financial overview & metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const wallets = await Wallet.find({});

    const totalLiquidity = wallets.reduce((acc, w) => acc + w.mainBalance, 0);
    const totalProfitBalances = wallets.reduce((acc, w) => acc + w.profitBalance, 0);
    const totalReferralBalances = wallets.reduce((acc, w) => acc + w.referralBalance, 0);

    const pendingDepositsCount = await Transaction.countDocuments({ type: 'DEPOSIT', status: 'PENDING' });
    const pendingWithdrawalsCount = await Transaction.countDocuments({ type: 'WITHDRAWAL_REQUEST', status: 'PENDING' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLiquidity,
        totalProfitBalances,
        totalReferralBalances,
        pendingDepositsCount,
        pendingWithdrawalsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of all pending manual deposits
// @route   GET /api/admin/deposits/pending
// @access  Private/Admin
export const getPendingDeposits = async (req, res, next) => {
  try {
    const pendingDeposits = await Transaction.find({ type: 'DEPOSIT', status: 'PENDING' })
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: pendingDeposits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a manual deposit request
// @route   PUT /api/admin/deposits/:id/action
// @access  Private/Admin
export const processDepositAction = async (req, res, next) => {
  try {
    const { action } = req.body;
    const transactionId = req.params.id;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, error: "Action must be 'APPROVE' or 'REJECT'" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.type !== 'DEPOSIT') {
      return res.status(404).json({ success: false, error: 'Pending deposit transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Transaction already ${transaction.status.toLowerCase()}` });
    }

    if (action === 'REJECT') {
      transaction.status = 'REJECTED';
      await transaction.save();

      return res.status(200).json({
        success: true,
        message: 'Manual deposit request rejected',
        data: transaction,
      });
    }

    transaction.status = 'COMPLETED';
    await transaction.save();

    const wallet = await Wallet.findOne({ user: transaction.user });
    const user = await User.findById(transaction.user);

    const previousBalance = wallet.mainBalance;
    wallet.mainBalance += transaction.amount;
    await wallet.save();

    if (previousBalance < MINIMUM_INITIAL_DEPOSIT && wallet.mainBalance >= MINIMUM_INITIAL_DEPOSIT) {
      if (!user.firstDepositAt) {
        user.firstDepositAt = new Date();
        await user.save();
      }
    }

    sendEmail({
      to: user.email,
      subject: 'Deposit Approved - TradeYield',
      html: depositApprovedTemplate(user.name, transaction.amount),
    }).catch((err) => console.error('Admin deposit approval email error:', err.message));

    res.status(200).json({
      success: true,
      message: 'Deposit approved and wallet credited successfully',
      data: {
        transaction,
        updatedMainBalance: wallet.mainBalance,
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

    // MANDATORY LOCK RE-ENGAGEMENT: Reset profit counter to 0 & timestamp last withdrawal upon approval
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