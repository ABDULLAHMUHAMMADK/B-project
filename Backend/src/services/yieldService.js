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
} from '../config/constants.js';

// Calculate tier floor yield ($300-$399 = $3, $400-$499 = $4, etc.)
export const calculateTierYield = (balance) => {
  if (balance < MINIMUM_INITIAL_DEPOSIT) return 0;

  const baseTier = Math.floor(balance / 100) * 100;
  return baseTier * DAILY_YIELD_RATE;
};

// Evaluate and unlock $50 flat direct referral bonus as soon as User B completes Grace Period 1
export const processPendingDirectReferrals = async () => {
  const pendingReferrals = await Referral.find({ hasTriggeredInitialBonus: false });

  for (const ref of pendingReferrals) {
    const userB = await User.findById(ref.referredUser);
    const walletB = await Wallet.findOne({ user: ref.referredUser });

    if (userB && walletB) {
      const isBalanceEligible = walletB.mainBalance >= MINIMUM_INITIAL_DEPOSIT;

      // User B completes Grace Period 1 as soon as userB.hasUsedGracePeriod becomes true OR has deposit timestamp
      const completedFirstGracePeriod = userB.hasUsedGracePeriod || Boolean(userB.firstDepositAt);

      if (isBalanceEligible && completedFirstGracePeriod) {
        const walletA = await Wallet.findOne({ user: ref.referrer });

        if (walletA) {
          // 1. Credit $50 flat direct bonus to User A
          walletA.referralBalance += REFERRAL_DIRECT_BONUS_FLAT;
          await walletA.save();

          // 2. Log ledger transaction for User A
          await Transaction.create({
            user: ref.referrer,
            type: 'REFERRAL_DIRECT_BONUS',
            amount: REFERRAL_DIRECT_BONUS_FLAT,
            description: `Flat $50 direct referral reward credited upon referred user completing initial grace period hold`,
          });

          // 3. Mark initial bonus as paid and qualify referrer for passive $0.20 rewards starting immediately
          ref.hasTriggeredInitialBonus = true;
          ref.isPassiveEligible = true;
          ref.totalEarnedFromUser += REFERRAL_DIRECT_BONUS_FLAT;
          await ref.save();

          console.log(`✅ [Referral System] Unlocked $50 direct bonus for referrer ${ref.referrer} at end of Grace Period 1!`);
        }
      }
    }
  }
};

// Process returns & referral rewards
export const processDailyYields = async () => {
  console.log('--- Starting Daily Yield & Referral Processing ---');

  try {
    // 1. Distribute daily 1% yield to active accounts & expire Grace Period 1 on 1st run
    const eligibleWallets = await Wallet.find({ mainBalance: { $gte: MINIMUM_INITIAL_DEPOSIT } }).populate('user');

    let processedCount = 0;
    let totalYieldDistributed = 0;

    for (const wallet of eligibleWallets) {
      const yieldAmount = calculateTierYield(wallet.mainBalance);

      if (yieldAmount > 0) {
        // Increment yield balances
        wallet.profitBalance += yieldAmount;
        wallet.unwithdrawnProfitCounter += yieldAmount;
        await wallet.save();

        // Create transaction record
        await Transaction.create({
          user: wallet.user._id,
          type: 'DAILY_YIELD',
          amount: yieldAmount,
          description: `Daily 1% compounding yield on $${wallet.mainBalance} USDT tier base`,
        });

        // Expire Grace Period 1 flag immediately on 1st yield distribution cycle
        if (wallet.user.firstDepositAt && !wallet.user.hasUsedGracePeriod) {
          await User.findByIdAndUpdate(wallet.user._id, { hasUsedGracePeriod: true });
        }

        processedCount++;
        totalYieldDistributed += yieldAmount;
      }
    }

    // 2. Evaluate & pay out $50 flat direct bonus on the same 1st cycle run
    await processPendingDirectReferrals();

    // 3. Process $0.20 daily passive referral payouts for active nodes
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