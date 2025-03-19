
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders } from './types.ts';
import { validatePaymentRequest } from './validators.ts';
import { createPaymentRecord, getFingerprintId, getUserId } from './db.ts';
import { createStripeSession } from './stripe.ts';

serve(async (req) => {
  console.log('Payment request received');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
      }
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    console.log('Stripe initialized');

    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData));
    
    const validation = validatePaymentRequest(requestData);
    if (!validation.isValid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { amount, recipientId, recipientName, email, name, message, campaignId } = requestData;
    const amountInCents = Math.round(Number(amount) * 100);
    console.log('Processed amount in cents:', amountInCents);

    const origin = req.headers.get('origin');
    if (!origin) {
      console.error('Missing origin header');
      return new Response(
        JSON.stringify({ error: 'Missing origin header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    try {
      const userId = await getUserId(authHeader);
      console.log('User authentication processed:', userId ? 'authenticated' : 'anonymous');

      let fingerprintId;
      try {
        fingerprintId = await getFingerprintId(recipientId);
        console.log('Found fingerprint:', fingerprintId);
      } catch (fingerprintError) {
        console.error('Fingerprint error:', fingerprintError);
        return new Response(
          JSON.stringify({ error: `Failed to get fingerprint: ${fingerprintError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      let payment;
      try {
        payment = await createPaymentRecord({
          amount: amountInCents,
          currency: 'gbp',
          user_id: userId,
          fingerprint_id: fingerprintId,
          status: 'pending',
          stripe_payment_email: email,
          message: message,
          donor_name: name,
          campaignId: campaignId
        });
        console.log('Payment record created:', payment.id);
      } catch (paymentError) {
        console.error('Payment record creation error:', paymentError);
        return new Response(
          JSON.stringify({ error: `Failed to create payment record: ${paymentError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      try {
        const session = await createStripeSession(
          stripe,
          amountInCents,
          origin,
          payment,
          recipientId,
          fingerprintId,
          userId,
          email,
          name,
          message,
          campaignId
        );

        console.log('Stripe session created successfully:', session.id);
        
        return new Response(
          JSON.stringify({ 
            url: session.url,
            paymentId: payment.id,
            sessionId: session.id  // Add session ID to response for debugging
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (stripeError) {
        console.error('Stripe session creation error:', stripeError);
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe session: ${stripeError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } catch (error) {
      console.error('User authentication error:', error);
      return new Response(
        JSON.stringify({ error: `Authentication error: ${error.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Global error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
