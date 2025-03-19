
import { PaymentData } from './types.ts';

export const createStripeSession = async (
  stripe: any,
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
  console.log('Creating Stripe session with parameters:', {
    amountInCents,
    paymentId: payment.id,
    recipientId,
    fingerprintId,
    userId,
    email,
    name,
    hasMessage: !!message,
    hasCampaignId: !!campaignId
  });

  const successUrl = `${origin}/payment-success?payment_id=${payment.id}`;
  const cancelUrl = `${origin}/payment-cancelled?payment_id=${payment.id}`;
  
  console.log('Payment success URL:', successUrl);
  console.log('Payment cancel URL:', cancelUrl);

  try {
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
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        payment_id: payment.id,
        recipient_id: recipientId,
        fingerprint_id: fingerprintId,
        user_id: userId || 'anonymous',
        donor_name: name || 'Anonymous',
        message: message || '',
        campaign_id: campaignId || ''
      }
    });
    
    console.log('Stripe session created:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};
