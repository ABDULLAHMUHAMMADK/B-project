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

  const baseTier = Math.floor(balance / 100) * 100;
  return baseTier * DAILY_YIELD_RATE;
};

// Check and trigger flat $50 direct referral bonuses ON THE VERY FIRST CRON CYCLE
export const processPendingDirectReferrals = async () => {
  const pendingReferrals = await Referral.find({ hasTriggeredInitialBonus: false });

  for (const ref of pendingReferrals) {
    const userB = await User.findById(ref.referredUser);
    const walletB = await Wallet.findOne({ user: ref.referredUser });

    if (userB && walletB) {
      const isBalanceEligible = walletB.mainBalance >= MINIMUM_INITIAL_DEPOSIT;

      // QUALIFICATION CHECK: 
      // User B is qualified if their balance is >= $300 AND either:
      // 1. userB.hasUsedGracePeriod is true (1st cycle completed)
      // OR
      // 2. 3 minutes (0.05 hours) have elapsed since firstDepositAt
      let hasStayedRequiredPeriod = false;
      if (userB.hasUsedGracePeriod) {
        hasStayedRequiredPeriod = true;
      } else if (userB.firstDepositAt) {
        const timeDiffMs = new Date().getTime() - new Date(userB.firstDepositAt).getTime() + 15000; // 15s tolerance
        const hoursElapsed = timeDiffMs / (1000 * 60 * 60);
        hasStayedRequiredPeriod = hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS;
      }

      // Condition: User B maintained $300+ through the single 1st grace period
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
            description: `Flat $50 direct referral reward credited (Referred user completed 1st cycle hold)`,
          });

          // 3. Mark bonus as triggered and qualify referrer for daily passive rewards instantly
          ref.hasTriggeredInitialBonus = true;
          ref.isPassiveEligible = true;
          ref.totalEarnedFromUser += REFERRAL_DIRECT_BONUS_FLAT;
          await ref.save();

          console.log(`✅ [Referral System] Unlocked $50 direct bonus for referrer ${ref.referrer} on Cycle 1!`);
        }
      }
    }
  }
};

// Process daily returns across all eligible active accounts
export const processDailyYields = async () => {
  console.log('--- Starting Daily Yield & Referral Processing ---');

  try {
    // STEP 1: Fetch all wallets with mainBalance >= $300 and distribute daily 1% yield
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

        // Create Transaction record for statement history
        await Transaction.create({
          user: wallet.user._id,
          type: 'DAILY_YIELD',
          amount: yieldAmount,
          description: `Daily 1% compounding yield on $${wallet.mainBalance} USDT tier base`,
        });

        // IMMEDIATELY FLIP GRACE PERIOD FLAG on the 1st yield distribution!
        if (wallet.user.firstDepositAt && !wallet.user.hasUsedGracePeriod) {
          const timeDiffMs = new Date().getTime() - new Date(wallet.user.firstDepositAt).getTime() + 15000;
          const hoursElapsed = timeDiffMs / (1000 * 60 * 60);

          if (hoursElapsed >= WITHDRAWAL_GRACE_PERIOD_HOURS) {
            await User.findByIdAndUpdate(wallet.user._id, { hasUsedGracePeriod: true });
          }
        }

        processedCount++;
        totalYieldDistributed += yieldAmount;
      }
    }

    // STEP 2: Evaluate & payout flat $50 direct referral bonus (NOW GUARANTEED ON CYCLE 1)
    await processPendingDirectReferrals();

    // STEP 3: Process $0.20 Daily Passive Referral Bonuses
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