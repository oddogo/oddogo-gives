
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
  console.log('Creating Stripe session with params:', {
    amount: amountInCents,
    paymentId: payment.id,
    recipientId,
    fingerprintId,
    userId,
    email,
    campaignId
  });

  try {
    const successUrl = campaignId 
      ? `${origin}/payment-success?recipient_id=${recipientId}&campaign_id=${campaignId}`
      : `${origin}/payment-success?recipient_id=${recipientId}`;
    
    // Prepare metadata object without empty values
    const metadata: Record<string, string> = {
      payment_id: payment.id,
      recipient_id: recipientId,
      fingerprint_id: fingerprintId,
      user_id: userId || 'anonymous',
    };
    
    // Only add campaign_id to metadata if it has a value
    if (campaignId && campaignId.trim() !== '') {
      metadata.campaign_id = campaignId;
    }
      
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Donation',
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
      metadata: metadata,
    });

    console.log('Stripe session created:', session.id);
    console.log('Session metadata:', metadata);
    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};
