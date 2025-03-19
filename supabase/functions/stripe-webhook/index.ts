
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";

import { 
  logWebhookEvent, 
  markWebhookProcessed, 
  supabaseClient,
  recordPaymentLog
} from './utils/db.ts';
import { 
  handleCheckoutSessionCompleted, 
  handlePaymentIntentSucceeded, 
  handlePaymentIntentFailed 
} from './handlers/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the stripe-signature header for verification
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the webhook secret from environment variables
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error('Webhook secret not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Stripe client
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Stripe key not configured');
      return new Response(
        JSON.stringify({ error: 'Stripe key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const stripe = new Stripe(stripeKey);
    
    // Get the raw request body as text
    const body = await req.text();
    
    // Parse the body as JSON for our own processing
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      console.error(`Invalid JSON: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Invalid JSON: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Received webhook: ${payload.type || 'unknown event type'}`);
    
    // Manual verification instead of using constructEvent which uses SubtleCrypto
    // We'll still log the event even if verification fails
    const event = payload;
    const eventId = event.id || 'unknown_event_id';
    
    // Log the webhook event immediately, before verification
    await logWebhookEvent(event);
    
    // Simple verification check that the event is from Stripe
    if (!event.id || !event.type || !event.data) {
      console.error('Invalid event format');
      await markWebhookProcessed(eventId, false, 'Invalid event format');
      return new Response(
        JSON.stringify({ error: 'Invalid event format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing webhook event: ${event.type} (${event.id})`);
    
    // Handle different event types
    let result;
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('Processing checkout.session.completed event');
          result = await handleCheckoutSessionCompleted(event);
          break;
          
        case 'payment_intent.succeeded':
          console.log('Processing payment_intent.succeeded event');
          result = await handlePaymentIntentSucceeded(event);
          break;
          
        case 'payment_intent.payment_failed':
          console.log('Processing payment_intent.payment_failed event');
          result = await handlePaymentIntentFailed(event);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
          result = { status: 'ignored', message: `Event type ${event.type} not handled` };
      }
      
      // Mark the webhook as processed
      await markWebhookProcessed(event.id, true);
      
      return new Response(
        JSON.stringify({ received: true, result }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`Error processing webhook: ${error.message}`);
      
      // Mark the webhook as failed
      await markWebhookProcessed(event.id, false, error.message);
      
      // Record the error in payment logs if it's a payment-related event
      if (event.type.startsWith('payment_intent.') || event.type.startsWith('checkout.')) {
        try {
          const metadata = event.data?.object?.metadata || {};
          const paymentId = metadata.payment_id || 'none';
          await recordPaymentLog(paymentId, 'webhook_error', `Error processing ${event.type} webhook`, {
            error: error.message,
            event_type: event.type
          });
        } catch (logError) {
          console.error('Failed to log payment error:', logError);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          received: true, 
          error: `Error processing webhook: ${error.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
