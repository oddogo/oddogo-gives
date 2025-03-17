
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders } from './types.ts';
import { validatePaymentRequest } from './validators.ts';
import { createPaymentRecord, getFingerprintId, getUserId } from './db.ts';
import { createStripeSession } from './stripe.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    console.log('Services initialized');

    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    const validation = validatePaymentRequest(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { amount, recipientId, email, name, message, campaignId } = requestData;
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(Number(amount) * 100);

    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Missing origin header');
    }

    const authHeader = req.headers.get('Authorization');
    const userId = await getUserId(authHeader);
    console.log('User authentication processed:', userId ? 'authenticated' : 'anonymous');

    const fingerprintId = await getFingerprintId(recipientId);
    console.log('Found fingerprint:', fingerprintId);

    // Create payment record with fingerprint_id and email
    const payment = await createPaymentRecord({
      amount: amountInCents,
      currency: 'gbp',
      user_id: userId,
      fingerprint_id: fingerprintId,
      status: 'pending',
      email: email
    });
    console.log('Payment record created:', payment.id);

    const session = await createStripeSession(
      stripe,
      amountInCents,
      origin,
      payment,
      recipientId,
      fingerprintId,
      userId,
      email
    );

    return new Response(
      JSON.stringify({ 
        url: session.url,
        paymentId: payment.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
