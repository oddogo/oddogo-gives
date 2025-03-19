
import { PaymentData } from './types.ts';

export const createStripeSession = async (
  stripe: any,
  amountInCents: number,
  origin: string,
  payment: any,
  recipientId: string,
  recipientName: string,
  fingerprintId: string | null,
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
    recipientName,
    fingerprintId,
    userId,
    email,
    name,
    hasMessage: !!message,
    hasCampaignId: !!campaignId
  });

  const successUrl = `${origin}/payment-success?payment_id=${payment.id}&recipient_id=${recipientId}`;
  const cancelUrl = `${origin}/payment-cancelled?payment_id=${payment.id}`;
  
  console.log('Payment success URL:', successUrl);
  console.log('Payment cancel URL:', cancelUrl);

  try {
    // Prepare metadata with only valid values
    const metadata: Record<string, string> = {
      payment_id: payment.id,
      recipient_id: recipientId,
      recipient_name: recipientName,
      user_id: userId || 'anonymous',
      donor_name: name || 'Anonymous'
    };
    
    // Only add these fields if they exist
    if (fingerprintId) metadata.fingerprint_id = fingerprintId;
    if (message) metadata.message = message;
    if (campaignId) metadata.campaign_id = campaignId;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Donation',
              description: `Donation to ${recipientName}`
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
      metadata: metadata
    });
    
    console.log('Stripe session created:', session.id);
    return session;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
};
