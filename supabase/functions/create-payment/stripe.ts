
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
  name?: string,
  message?: string,
  campaignId?: string
) => {
  console.log('Creating Stripe session with params:', {
    amount: amountInCents,
    paymentId: payment.id,
    recipientId,
    fingerprintId,
    userId,
    email,
    name,
    message,
    campaignId
  });

  // Validate fingerprint ID is present
  if (!fingerprintId) {
    console.error('Missing fingerprint ID when creating Stripe session');
    throw new Error('Missing fingerprint ID for payment');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: campaignId ? 
                `Donation to campaign` : 
                `Donation`,
              description: message ? `Message: ${message}` : undefined,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?recipient_id=${recipientId}${campaignId ? `&campaign_id=${campaignId}` : ''}`,
      cancel_url: `${origin}/payment-cancelled`,
      customer_email: email,
      metadata: {
        payment_id: payment.id,
        recipient_id: recipientId,
        fingerprint_id: fingerprintId,
        user_id: userId || 'anonymous',
        donor_name: name || '',
        message: message || '',
        campaign_id: campaignId || ''
      },
    });

    console.log('Stripe session created:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};
