
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { updatePaymentWithStripeId } from './db.ts';

export const createStripeSession = async (
  stripe: Stripe,
  amount: number,
  origin: string,
  payment: any,
  recipientId: string,
  fingerprintId: string,
  userId: string | null,
  email?: string
): Promise<Stripe.Checkout.Session> => {
  console.log('Creating Stripe session with amount:', amount);
  
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Donation',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/payment-success?payment_id=${payment.id}&recipient_id=${recipientId}`,
    cancel_url: `${origin}/payment-cancelled`,
    payment_intent_data: {
      metadata: {
        payment_id: payment.id,
        fingerprintId,
        userId: userId || 'anonymous'
      }
    },
    metadata: {
      payment_id: payment.id,
      fingerprintId,
      userId: userId || 'anonymous'
    }
  };

  // Add customer email if provided
  if (email) {
    sessionConfig.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  console.log('Stripe session created:', session.id);
  console.log('Session metadata:', session.metadata);
  console.log('Payment intent data:', session.payment_intent);

  if (session.payment_intent) {
    try {
      await updatePaymentWithStripeId(payment.id, session.payment_intent as string);
      console.log('Updated payment record with Stripe payment intent ID:', session.payment_intent);
    } catch (error) {
      console.error('Failed to update payment record with Stripe ID:', error);
    }
  }

  return session;
};
