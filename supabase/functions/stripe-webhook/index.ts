
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { 
  logWebhookEvent, 
  markWebhookProcessed, 
  handleCheckoutSessionCompleted, 
  handlePaymentIntentSucceeded, 
  handlePaymentIntentFailed 
} from './handlers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-deno-subhost, x-supabase-client',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Helper function to record errors in stripe_payment_logs
const recordErrorInLogs = async (error: Error, eventId?: string, paymentId?: string) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase
      .from('stripe_payment_logs')
      .insert({
        payment_id: paymentId || null,
        status: 'error',
        message: `Webhook error: ${error.message}`,
        metadata: { event_id: eventId, stack: error.stack }
      });
      
    console.log('Error recorded in payment logs');
  } catch (logError) {
    console.error('Failed to record error in logs:', logError);
  }
};

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
    console.log('Raw webhook body length:', body.length);
    console.log('Raw webhook body preview:', body.substring(0, 200) + '...');

    let event;
    try {
      // Using asynchronous constructEventAsync instead of synchronous constructEvent
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('Event constructed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      await recordErrorInLogs(err, 'signature_verification_failed');
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract payment_id from metadata for logging purposes
    const paymentId = event.data.object.metadata?.payment_id || null;
    
    // Store webhook event in database - wrap in try/catch to prevent failure
    try {
      await logWebhookEvent(
        event.type,
        event.id,
        paymentId,
        event,
        !event.livemode
      );
    } catch (logError) {
      console.error('Failed to log webhook event:', logError);
      // Continue processing even if logging fails
    }

    console.log('Processing webhook event:', event.type);
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata || {}));

    try {
      // Process different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
          
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;
          
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;
          
        default:
          console.log('Unhandled event type:', event.type);
      }

      // Mark webhook as processed - wrap in try/catch to prevent failure
      try {
        await markWebhookProcessed(event.id);
      } catch (markError) {
        console.error('Failed to mark webhook as processed:', markError);
        // Continue to return success even if marking fails
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (processError) {
      console.error('Error processing webhook event:', processError);
      await recordErrorInLogs(processError, event.id, paymentId);
      
      // Still return 200 to prevent Stripe from retrying, but include error details
      return new Response(
        JSON.stringify({ received: true, warning: processError.message }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 even on processing errors to prevent retries
        }
      );
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    await recordErrorInLogs(error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
