// Backend/src/controllers/stripeTestWebhookController.js
import Stripe from 'stripe';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeTestWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    // Verifies raw buffer payload against your local CLI webhook signing secret
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Stripe Webhook Signature Verification Failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const transactionId = session.client_reference_id;

    try {
      const transaction = await Transaction.findById(transactionId);

      if (transaction && transaction.status === 'PENDING') {
        // 1. Mark ledger transaction as APPROVED
        transaction.status = 'APPROVED';
        await transaction.save();

        // 2. Increment balance on User model
        await User.findByIdAndUpdate(transaction.user, {
          $inc: { balance: transaction.amount },
        });

        // 3. Increment mainBalance on Wallet model (Read by React Dashboard UI)
        await Wallet.findOneAndUpdate(
          { user: transaction.user },
          { $inc: { mainBalance: transaction.amount } },
          { upsert: true, new: true }
        );

        console.log(`✅ [TEST MODE] Transaction ${transactionId} approved! $${transaction.amount} credited.`);
      }
    } catch (dbErr) {
      console.error('❌ Error updating test deposit in database:', dbErr.message);
    }
  }

  res.status(200).json({ received: true });
};