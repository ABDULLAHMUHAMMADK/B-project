// src/controllers/depositController.js
import crypto from 'crypto';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { createBinanceOrder } from '../services/binancePayService.js';
import { MINIMUM_INITIAL_DEPOSIT } from '../config/constants.js';

// Helper function to calculate required minimum top-up
const getMinRequiredDeposit = (currentBalance) => {
  if (currentBalance > 0 && currentBalance < MINIMUM_INITIAL_DEPOSIT) {
    return MINIMUM_INITIAL_DEPOSIT - currentBalance;
  } else if (currentBalance >= MINIMUM_INITIAL_DEPOSIT) {
    return 1;
  }
  return MINIMUM_INITIAL_DEPOSIT;
};

// @desc    Initiate Binance Pay Deposit Order
// @route   POST /api/deposits/binance-order
// @access  Private
export const initiateBinanceDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ user: req.user._id });

    const currentBalance = wallet ? wallet.mainBalance : 0;
    const minRequired = getMinRequiredDeposit(currentBalance);

    if (!amount || Number(amount) < minRequired) {
      return res.status(400).json({
        success: false,
        error: `Deposit amount below required threshold. Minimum deposit allowed for your account is $${minRequired} USDT.`,
      });
    }

    const merchantTradeNo = `TY_DEP_${Date.now()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    await Transaction.create({
      user: req.user._id,
      type: 'DEPOSIT',
      amount: Number(amount),
      status: 'PENDING',
      merchantTradeNo,
      description: 'Binance Pay automated deposit checkout initiated',
    });

    const binanceResponse = await createBinanceOrder({
      merchantTradeNo,
      totalFee: Number(amount),
      currency: 'USDT',
      productDetail: `TradeYield Capital Deposit - ${req.user.email}`,
    });

    if (binanceResponse.status === 'SUCCESS') {
      return res.status(200).json({
        success: true,
        message: 'Binance Pay checkout order created successfully',
        data: {
          merchantTradeNo,
          amount: Number(amount),
          checkoutUrl: binanceResponse.data.checkoutUrl,
          qrcodeLink: binanceResponse.data.qrcodeLink,
          universalUrl: binanceResponse.data.universalUrl,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: binanceResponse.errorMessage || 'Failed to generate Binance Pay invoice',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Manual Deposit Request (Admin Verification Fallback)
// @route   POST /api/deposits/manual
// @access  Private
export const submitManualDeposit = async (req, res, next) => {
  try {
    const { amount, txHash, description } = req.body;

    if (!amount || !txHash) {
      return res.status(400).json({
        success: false,
        error: 'Please provide deposit amount and transaction hash (TxID)',
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    const currentBalance = wallet ? wallet.mainBalance : 0;
    const minRequired = getMinRequiredDeposit(currentBalance);

    if (Number(amount) < minRequired) {
      return res.status(400).json({
        success: false,
        error: `Amount below required threshold. Minimum deposit required: $${minRequired} USDT.`,
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'DEPOSIT',
      amount: Number(amount),
      txHash,
      status: 'PENDING',
      description: description || 'Manual deposit transaction hash submitted for verification',
    });

    res.status(201).json({
      success: true,
      message: 'Manual deposit proof submitted. Awaiting admin review.',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};