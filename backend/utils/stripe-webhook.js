/**
 * Stripe Payment Webhook Handler
 * 
 * This module handles Stripe payment webhooks to confirm donations
 * and update donation status in the database.
 * 
 * Setup:
 * 1. Install stripe: npm install stripe
 * 2. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env
 * 3. Configure Stripe webhook endpoint to POST to /webhooks/stripe
 */

const { Donation, DonationCampaign } = require('../models/Index');

/**
 * Handle payment_intent.succeeded webhook
 * Called when a Stripe payment is successfully processed
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Processing payment intent:', paymentIntent.id);

    // Find donation by payment intent ID
    const donation = await Donation.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (!donation) {
      console.warn('Donation not found for payment intent:', paymentIntent.id);
      return;
    }

    // Update donation status
    donation.paymentStatus = 'completed';
    donation.completedAt = new Date();
    donation.stripeChargeId = paymentIntent.charges.data[0]?.id || '';
    await donation.save();

    // Update campaign
    const campaign = await DonationCampaign.findById(donation.campaign);
    if (campaign) {
      campaign.currentAmount += donation.amount;
      campaign.donorCount = (campaign.donorCount || 0) + 1;
      await campaign.save();
    }

    console.log('✅ Donation completed:', donation._id);
  } catch (error) {
    console.error('Error processing payment intent succeeded:', error.message);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed webhook
 * Called when a Stripe payment fails
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Processing failed payment:', paymentIntent.id);

    const donation = await Donation.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (donation) {
      donation.paymentStatus = 'failed';
      await donation.save();
      console.log('❌ Donation marked as failed:', donation._id);
    }
  } catch (error) {
    console.error('Error processing payment intent failed:', error.message);
    throw error;
  }
}

/**
 * Handle charge.refunded webhook
 * Called when a payment is refunded
 */
async function handleChargeRefunded(charge) {
  try {
    console.log('Processing refund:', charge.id);

    const donation = await Donation.findOne({
      stripeChargeId: charge.id
    });

    if (donation) {
      donation.paymentStatus = 'refunded';
      await donation.save();

      // Update campaign amount
      const campaign = await DonationCampaign.findById(donation.campaign);
      if (campaign) {
        campaign.currentAmount = Math.max(0, campaign.currentAmount - donation.amount);
        campaign.donorCount = Math.max(0, campaign.donorCount - 1);
        await campaign.save();
      }

      console.log('♻️ Donation refunded:', donation._id);
    }
  } catch (error) {
    console.error('Error processing charge refunded:', error.message);
    throw error;
  }
}

/**
 * Process Stripe webhook event
 * @param {Object} event - Stripe event object
 * @returns {Promise}
 */
async function processStripeWebhook(event) {
  console.log('🔔 Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'charge.dispute.created':
        console.log('⚠️  Dispute created:', event.data.object.id);
        break;

      default:
        console.log('⏭️  Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error.message);
    throw error;
  }
}

module.exports = {
  processStripeWebhook,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeRefunded
};
