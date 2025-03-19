
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

export const createStripeSession = async (
  stripe: Stripe,
  amountInCents: number,
  origin: string,
  payment: any,
  recipientId: string,
  fingerprintId: string,
  userId: string | null,
  email?: string,
  campaignId?: string
) => {
  // Log all parameters including campaign_id
  console.log('Creating Stripe session with params:', {
    amount: amountInCents,
    paymentId: payment.id,
    recipientId,
    fingerprintId,
    userId,
    email,
    campaignId: campaignId || 'None'
  });

  try {
    const successUrl = campaignId 
      ? `${origin}/payment-success?recipient_id=${recipientId}&campaign_id=${campaignId}`
      : `${origin}/payment-success?recipient_id=${recipientId}`;
      
    // Ensure campaign_id is properly sanitized (not empty string)
    const sanitizedCampaignId = campaignId && campaignId.trim() !== '' ? campaignId : null;
    
    // Create session with campaign_id in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: sanitizedCampaignId ? 'Campaign Donation' : 'Donation',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: `${origin}/payment-cancelled`,
      customer_email: email,
      metadata: {
        payment_id: payment.id,
        recipient_id: recipientId,
        fingerprint_id: fingerprintId,
        user_id: userId || 'anonymous',
        campaign_id: sanitizedCampaignId || ''
      },
    });

    console.log('Stripe session created:', session.id);
    console.log('Session metadata:', session.metadata);
    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};
