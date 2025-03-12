
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

    // Store webhook event first
    const { error: webhookError } = await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_type: event.type,
        stripe_event_id: event.id,
        payment_id: event.data.object.metadata?.payment_id,
        status: 'received',
        raw_event: event,
        is_test: !event.livemode
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
      return new Response(
        JSON.stringify({ error: 'Failed to store webhook event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object));
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata));

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;
        
        console.log('Processing checkout session completed:', paymentId);
        console.log('Session details:', {
          id: session.id,
          email: session.customer_email,
          customer: session.customer,
          payment_intent: session.payment_intent,
          payment_method: session.payment_method
        });
        
        if (paymentId) {
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              stripe_payment_intent_id: session.payment_intent,
              stripe_payment_method_id: session.payment_method,
              stripe_payment_email: session.customer_email,
              stripe_customer_id: session.customer,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .select();

          if (updateError) {
            console.error('Error updating payment record:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment record' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully updated payment with Stripe session details');
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        
        console.log('Processing successful payment:', paymentId);
        console.log('Payment details:', {
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentIntent.payment_method,
          charge_id: paymentIntent.latest_charge,
        });
        
        if (paymentId) {
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update({ 
              status: 'completed',
              stripe_payment_intent_id: paymentIntent.id,
              stripe_payment_method_id: paymentIntent.payment_method,
              stripe_charge_id: paymentIntent.latest_charge,
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .select();

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment status' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully updated payment status to completed');

          const { error: logError } = await supabaseClient
            .from('stripe_payment_logs')
            .insert({
              payment_id: paymentId,
              metadata: {
                ...event.data.object,
                payment_intent_id: paymentIntent.id,
                payment_method_id: paymentIntent.payment_method,
                charge_id: paymentIntent.latest_charge
              },
              status: 'completed',
              message: 'Payment completed successfully'
            })
            .select();

          if (logError) {
            console.error('Error logging payment status:', logError);
            return new Response(
              JSON.stringify({ error: 'Failed to log payment status' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully logged payment completion');
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
              updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)
            .select();

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment status' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully updated payment status to failed');

          const { error: logError } = await supabaseClient
            .from('stripe_payment_logs')
            .insert({
              payment_id: paymentId,
              metadata: event.data.object,
              status: 'failed',
              message: paymentIntent.last_payment_error?.message || 'Payment failed'
            })
            .select();

          if (logError) {
            console.error('Error logging payment failure:', logError);
            return new Response(
              JSON.stringify({ error: 'Failed to log payment failure' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully logged payment failure');
        }
        break;
      }
      default: {
        console.log('Unhandled event type:', event.type);
      }
    }

    // Mark webhook as processed
    const { error: processedError } = await supabaseClient
      .from('stripe_webhook_events')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id)
      .select();

    if (processedError) {
      console.error('Error marking webhook as processed:', processedError);
      return new Response(
        JSON.stringify({ error: 'Failed to mark webhook as processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Successfully marked webhook as processed');

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
