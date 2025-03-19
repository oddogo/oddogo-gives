
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders, StripeEvent } from './types.ts';
import { storeWebhookEvent, markWebhookAsProcessed } from './db.ts';
import { handleCheckoutSessionCompleted, handlePaymentIntentSucceeded, handlePaymentIntentFailed } from './handlers.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  console.log('Received webhook request');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  // Validate request method
  if (req.method !== 'POST') {
    console.error('Invalid request method:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found in headers');
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const body = await req.text();
    console.log('Raw webhook body:', body);

    let event: StripeEvent;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('Event constructed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Store webhook event first
    await storeWebhookEvent(event);

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object));
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata || {}));

    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case 'payment_intent.succeeded': {
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      }
      case 'payment_intent.payment_failed': {
        await handlePaymentIntentFailed(event.data.object);
        break;
      }
      default: {
        console.log('Unhandled event type:', event.type);
      }
    }

    // Mark webhook as processed
    await markWebhookAsProcessed(event.id);

    console.log('Successfully processed webhook event');

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
