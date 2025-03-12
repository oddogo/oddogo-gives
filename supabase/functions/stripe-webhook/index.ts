
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('Received Stripe webhook event:', event.type);

    // Store the webhook event
    const { error: webhookError } = await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payment_id: event.data.object.metadata?.payment_id,
        status: 'received',
        raw_event: event
      });

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
      throw webhookError;
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        
        if (paymentId) {
          // Update payment status
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
              stripe_payment_email: paymentIntent.receipt_email,
              stripe_customer_id: paymentIntent.customer,
              stripe_charge_id: paymentIntent.latest_charge
            })
            .eq('id', paymentId);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
          }

          // Log the status change
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
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        
        if (paymentId) {
          // Update payment status
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              status: 'failed',
              stripe_payment_intent_id: paymentIntent.id
            })
            .eq('id', paymentId);

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            throw updateError;
          }

          // Log the failure
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
        }
        break;
      }
    }

    // Mark webhook as processed
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

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
