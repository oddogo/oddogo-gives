
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-webhook-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  console.log('Received webhook request');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Skip JWT verification if it's a Stripe webhook (identified by custom header)
  const isStripeWebhook = req.headers.get('x-webhook-key') === Deno.env.get('STRIPE_WEBHOOK_KEY');
  
  if (!isStripeWebhook) {
    console.log('Request missing webhook key - potential unauthorized access');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== 'POST') {
    console.error('Invalid request method:', req.method);
    return new Response('Method not allowed', { 
      headers: corsHeaders,
      status: 405 
    });
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

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('Event constructed successfully:', event.type);
      console.log('Event metadata:', event.data.object.metadata);
      console.log('Full event data:', JSON.stringify(event.data.object, null, 2));
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Store webhook event for tracking/retry purposes
    const { error: webhookError } = await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payment_id: event.data.object.metadata?.payment_id,
        status: 'received',
        raw_event: event,
        is_test: !event.livemode,
        attempts: 1
      });

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
      throw webhookError;
    }

    console.log('Processing webhook event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing completed checkout session:', session.id);
        console.log('Session metadata:', session.metadata);
        console.log('Payment intent data:', session.payment_intent_data);
        
        // Extract metadata from both possible locations
        const metadata = {
          ...session.payment_intent_data?.metadata,
          ...session.metadata
        };

        console.log('Combined metadata:', metadata);
        
        const paymentData = {
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
          user_id: metadata.userId || 'anonymous',
          fingerprint_id: metadata.fingerprintId,
          recipient_id: metadata.recipientId,
          stripe_payment_intent_id: session.payment_intent,
          stripe_payment_email: session.customer_email,
          stripe_customer_id: session.customer,
          stripe_session_id: session.id
        };

        console.log('Attempting to insert payment record:', paymentData);

        const { error: insertError } = await supabaseClient
          .from('stripe_payments')
          .insert(paymentData);

        if (insertError) {
          console.error('Error creating payment record:', insertError);
          throw insertError;
        }

        console.log('Successfully created payment record');
        break;
      }

      case 'checkout.session.expired': {
        console.log('Checkout session expired:', event.data.object.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        console.log('Failure reason:', paymentIntent.last_payment_error?.message);
        break;
      }
    }

    const { error: processedError } = await supabaseClient
      .from('stripe_webhook_events')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);

    if (processedError) {
      console.error('Error marking webhook as processed:', processedError);
      throw processedError;
    }

    console.log('Successfully marked webhook as processed');

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log the error and update the webhook event status
    try {
      await supabaseClient
        .from('stripe_webhook_events')
        .update({ 
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('stripe_event_id', event?.id);
    } catch (logError) {
      console.error('Error logging webhook failure:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
