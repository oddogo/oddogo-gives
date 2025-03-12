
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

export const createStripeSession = async (
  stripe: Stripe,
  amount: number,
  origin: string,
  email: string | null,
  recipientId: string,
  fingerprintId: string,
  userId: string | null
): Promise<Stripe.Checkout.Session> => {
  console.log('Creating Stripe session with params:', {
    amount,
    recipientId,
    fingerprintId,
    userId,
    email
  });
  
  const session = await stripe.checkout.sessions.create({
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
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&recipient_id=${recipientId}`,
    cancel_url: `${origin}/payment-cancelled`,
    metadata: {
      fingerprintId,
      userId: userId || 'anonymous',
      recipientId
    },
    customer_email: email
  });

  console.log('Stripe session created:', session.id);
  console.log('Session details:', {
    id: session.id,
    payment_intent: session.payment_intent,
    customer_email: session.customer_email,
    metadata: session.metadata
  });

  return session;
};
