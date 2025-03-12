
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
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
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { error: webhookError } = await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payment_id: event.data.object.metadata?.payment_id,
        status: 'received',
        raw_event: event,
        is_test: !event.livemode
      });

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
      throw webhookError;
    }

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object));
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata));

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        
        console.log('Processing successful payment:', paymentId);
        
        if (paymentId) {
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
              stripe_payment_email: paymentIntent.receipt_email,
              stripe_customer_id: paymentIntent.customer,
              stripe_charge_id: paymentIntent.latest_charge,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentId);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
          }

          console.log('Successfully updated payment status to completed');

          const { error: logError } = await supabaseClient
            .from('stripe_payment_logs')
            .insert({
              payment_id: paymentId,
              metadata: event.data.object,
              status: 'completed',
              message: 'Payment completed successfully'
            });

          if (logError) {
            console.error('Error logging payment status:', logError);
            throw logError;
          }

          console.log('Successfully logged payment completion');
        } else {
          console.warn('No payment_id found in metadata:', paymentIntent.metadata);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        
        console.log('Processing failed payment:', paymentId);
        
        if (paymentId) {
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              status: 'failed',
              stripe_payment_intent_id: paymentIntent.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentId);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
          }

          console.log('Successfully updated payment status to failed');

          const { error: logError } = await supabaseClient
            .from('stripe_payment_logs')
            .insert({
              payment_id: paymentId,
              metadata: event.data.object,
              status: 'failed',
              message: paymentIntent.last_payment_error?.message || 'Payment failed'
            });

          if (logError) {
            console.error('Error logging payment failure:', logError);
            throw logError;
          }

          console.log('Successfully logged payment failure');
        } else {
          console.warn('No payment_id found in metadata for failed payment');
        }
        break;
      }
      default: {
        console.log('Unhandled event type:', event.type);
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
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
