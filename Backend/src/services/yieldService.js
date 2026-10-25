// Backend/src/services/yieldService.js
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Referral from '../models/Referral.js';
import {
  DAILY_YIELD_RATE,
  REFERRAL_DIRECT_BONUS_FLAT,
  REFERRAL_DAILY_PASSIVE_USD,
  MINIMUM_INITIAL_DEPOSIT,
  WITHDRAWAL_GRACE_PERIOD_HOURS,
} from '../config/constants.js';

// Calculate tier floor yield ($300-$399 = $3, $400-$499 = $4, etc.)
export const calculateTierYield = (balance) => {
  if (balance < MINIMUM_INITIAL_DEPOSIT) return 0;

  // Floor down to nearest $100 bracket
  const baseTier = Math.floor(balance / 100) * 100;
  return baseTier * DAILY_YIELD_RATE; // e.g., 300 * 0.01 = $3.00
};

// Check and trigger flat $50 direct referral bonuses once referred user completes holding period
export const processPendingDirectReferrals = async () => {
  const pendingReferrals = await Referral.find({ hasTriggeredInitialBonus: false });

  for (const ref of pendingReferrals) {
    const userB = await User.findById(ref.referredUser);
    const walletB = await Wallet.findOne({ user: ref.referredUser });

    if (userB && walletB) {
      const isBalanceEligible = walletB.mainBalance >= MINIMUM_INITIAL_DEPOSIT;

      let hasStayedRequiredPeriod = false;
      if (userB.firstDepositAt) {
        const hoursElapsed = (new Date() - new Date(userB.firstDepositAt)) / (1000 * 60 * 60);
        // Uses dynamic constant (0.05 hours for 3-minute testing, 24 hours in production)
        hasStayedRequiredPeriod = hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS;
      }

      // Condition: User B maintained $300+ for the required grace period
      if (isBalanceEligible && hasStayedRequiredPeriod) {
        const walletA = await Wallet.findOne({ user: ref.referrer });

        if (walletA) {
          // 1. Credit flat $50 directly to referrer's referral balance
          walletA.referralBalance += REFERRAL_DIRECT_BONUS_FLAT;
          await walletA.save();

          // 2. Log transaction record for User A
          await Transaction.create({
            user: ref.referrer,
            type: 'REFERRAL_DIRECT_BONUS',
            amount: REFERRAL_DIRECT_BONUS_FLAT,
            description: `Flat $50 direct referral reward credited (Referred user maintained $300+ for grace period)`,
          });

          // 3. Mark bonus as triggered and qualify referrer for daily passive rewards
          ref.hasTriggeredInitialBonus = true;
          ref.isPassiveEligible = true;
          ref.totalEarnedFromUser += REFERRAL_DIRECT_BONUS_FLAT;
          await ref.save();

          console.log(`✅ [Referral System] Unlocked $50 direct bonus for referrer ${ref.referrer}`);
        }
      }
    }
  }
};

// Process daily returns across all eligible active accounts
export const processDailyYields = async () => {
  console.log('--- Starting Daily Yield & Referral Processing ---');

  try {
    // Step 1: Evaluate & payout qualifying flat $50 direct referral bonuses
    await processPendingDirectReferrals();

    // Step 2: Fetch all wallets with mainBalance >= $300
    const eligibleWallets = await Wallet.find({ mainBalance: { $gte: MINIMUM_INITIAL_DEPOSIT } }).populate('user');

    let processedCount = 0;
    let totalYieldDistributed = 0;

    for (const wallet of eligibleWallets) {
      const yieldAmount = calculateTierYield(wallet.mainBalance);

      if (yieldAmount > 0) {
        // Update user's yield balances
        wallet.profitBalance += yieldAmount;
        wallet.unwithdrawnProfitCounter += yieldAmount;
        await wallet.save();

        // Create Transaction record for user statement history
        await Transaction.create({
          user: wallet.user._id,
          type: 'DAILY_YIELD',
          amount: yieldAmount,
          description: `Daily 1% compounding yield on $${wallet.mainBalance} USDT tier base`,
        });

        // Flip hasUsedGracePeriod to true if grace period has passed since first deposit
        if (wallet.user.firstDepositAt && !wallet.user.hasUsedGracePeriod) {
          const hoursElapsed = (new Date() - new Date(wallet.user.firstDepositAt)) / (1000 * 60 * 60);
          if (hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS) {
            await User.findByIdAndUpdate(wallet.user._id, { hasUsedGracePeriod: true });
          }
        }

        processedCount++;
        totalYieldDistributed += yieldAmount;
      }
    }

    // Step 3: Process $0.20 Daily Passive Referral Bonuses
    const activeReferrals = await Referral.find({ isPassiveEligible: true });
    let referralBonusCount = 0;

    for (const ref of activeReferrals) {
      const downstreamWallet = await Wallet.findOne({ user: ref.referredUser });

      if (downstreamWallet && downstreamWallet.mainBalance >= MINIMUM_INITIAL_DEPOSIT) {
        const referrerWallet = await Wallet.findOne({ user: ref.referrer });
        if (referrerWallet) {
          referrerWallet.referralBalance += REFERRAL_DAILY_PASSIVE_USD;
          await referrerWallet.save();

          await Transaction.create({
            user: ref.referrer,
            type: 'REFERRAL_DAILY_PASSIVE',
            amount: REFERRAL_DAILY_PASSIVE_USD,
            description: `Daily passive referral bonus from active user node`,
          });

          ref.totalEarnedFromUser += REFERRAL_DAILY_PASSIVE_USD;
          await ref.save();
          referralBonusCount++;
        }
      } else {
        ref.isPassiveEligible = false;
        await ref.save();
      }
    }

    console.log(
      `--- Yield Processing Complete: ${processedCount} users paid ($${totalYieldDistributed.toFixed(
        2
      )} USDT), ${referralBonusCount} passive payouts issued ---`
    );
    return { processedCount, totalYieldDistributed, referralBonusCount };
  } catch (error) {
    console.error('Error during daily yield calculation:', error.message);
    throw error;
  }
};