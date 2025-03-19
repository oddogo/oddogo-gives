
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-deno-subhost, x-supabase-client',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Correctly initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log webhook event to database
async function logWebhookEvent(eventType, eventId, paymentId, eventData, isTestMode) {
  console.log('Logging webhook event:', { eventType, eventId, paymentId, isTestMode });

  try {
    const { error } = await supabase
      .from('stripe_webhook_logs')
      .insert({
        event_type: eventType,
        event_id: eventId,
        payment_id: paymentId,
        event_data: eventData,
        is_test: isTestMode,
        status: 'received'
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    } else {
      console.log('Webhook event logged successfully');
    }
  } catch (error) {
    console.error('Exception in logWebhookEvent:', error);
  }
}

// Mark webhook as processed
async function markWebhookProcessed(eventId) {
  console.log('Marking webhook as processed:', eventId);

  try {
    const { error } = await supabase
      .from('stripe_webhook_logs')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString() 
      })
      .eq('event_id', eventId);

    if (error) {
      console.error('Error marking webhook as processed:', error);
    } else {
      console.log('Webhook marked as processed successfully');
    }
  } catch (error) {
    console.error('Exception in markWebhookProcessed:', error);
  }
}

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout.session.completed event');
  console.log('Session:', JSON.stringify(session, null, 2));
  
  // Extract payment ID from metadata
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in session metadata');
    return;
  }

  try {
    // Get payment intent details
    const paymentIntentId = session.payment_intent;
    if (!paymentIntentId) {
      console.error('No payment intent ID found in session');
      return;
    }

    console.log('Updating payment record with payment intent ID:', paymentIntentId);
    
    // Update the payment record with session data
    const { data, error } = await supabase
      .from('stripe_payments')
      .update({
        stripe_payment_intent_id: paymentIntentId,
        status: 'processing'
      })
      .eq('id', paymentId)
      .select();

    if (error) {
      console.error('Error updating payment record:', error);
      return;
    }

    console.log('Payment record updated successfully:', data);
    
    // If this is connected to a campaign, update the campaign_payments table
    if (session.metadata?.campaign_id) {
      console.log('Updating campaign payment for campaign:', session.metadata.campaign_id);
      
      // First check if this payment is already linked to the campaign
      const { data: existingLink, error: checkError } = await supabase
        .from('campaign_payments')
        .select('id')
        .eq('payment_id', paymentId)
        .eq('campaign_id', session.metadata.campaign_id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing campaign link:', checkError);
      } else if (!existingLink) {
        // Only create the link if it doesn't exist
        const { error: campaignError } = await supabase
          .from('campaign_payments')
          .insert({
            campaign_id: session.metadata.campaign_id,
            payment_id: paymentId
          });
          
        if (campaignError) {
          console.error('Error linking payment to campaign:', campaignError);
        } else {
          console.log('Payment successfully linked to campaign');
        }
      } else {
        console.log('Payment already linked to campaign, skipping');
      }
    }
  } catch (error) {
    console.error('Exception in handleCheckoutSessionCompleted:', error);
  }
}

// Handle payment_intent.succeeded event
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Processing payment_intent.succeeded event');
  console.log('Payment Intent:', JSON.stringify(paymentIntent, null, 2));
  
  const paymentId = paymentIntent.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in payment intent metadata');
    return;
  }

  try {
    // Find the payment charge
    const chargeId = paymentIntent.latest_charge;
    console.log('Latest charge ID:', chargeId);

    // Get payment method details if available
    const paymentMethodId = paymentIntent.payment_method;
    console.log('Payment method ID:', paymentMethodId);

    console.log('Updating payment record with completed status and charge details');
    
    // Update payment record with successful payment data
    const updateData: any = {
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    // Only add the charge ID if it exists
    if (chargeId) {
      updateData.stripe_charge_id = chargeId;
    }

    // Only add the payment method ID if it exists
    if (paymentMethodId) {
      updateData.stripe_payment_method_id = paymentMethodId;
    }

    const { data, error } = await supabase
      .from('stripe_payments')
      .update(updateData)
      .eq('id', paymentId)
      .select();

    if (error) {
      console.error('Error updating payment with successful status:', error);
      return;
    }

    console.log('Payment marked as completed successfully:', data);
    
    // If this payment is connected to a campaign, ensure it's properly linked
    if (paymentIntent.metadata?.campaign_id) {
      const { data: existingLink, error: checkError } = await supabase
        .from('campaign_payments')
        .select('id')
        .eq('payment_id', paymentId)
        .eq('campaign_id', paymentIntent.metadata.campaign_id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing campaign link:', checkError);
      } else if (!existingLink) {
        // Only create the link if it doesn't exist
        const { error: campaignError } = await supabase
          .from('campaign_payments')
          .insert({
            campaign_id: paymentIntent.metadata.campaign_id,
            payment_id: paymentId
          });
          
        if (campaignError) {
          console.error('Error linking payment to campaign:', campaignError);
        } else {
          console.log('Payment successfully linked to campaign');
        }
      }
    }
  } catch (error) {
    console.error('Exception in handlePaymentIntentSucceeded:', error);
  }
}

// Handle payment_intent.payment_failed event
async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Processing payment_intent.payment_failed event');
  console.log('Payment Intent:', JSON.stringify(paymentIntent, null, 2));
  
  const paymentId = paymentIntent.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in payment intent metadata');
    return;
  }

  try {
    const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
    console.log('Payment failure reason:', failureMessage);
    
    // Update payment record with failed status
    const { data, error } = await supabase
      .from('stripe_payments')
      .update({
        status: 'failed',
        failure_message: failureMessage
      })
      .eq('id', paymentId)
      .select();

    if (error) {
      console.error('Error updating payment with failed status:', error);
      return;
    }

    console.log('Payment marked as failed successfully:', data);
  } catch (error) {
    console.error('Exception in handlePaymentIntentFailed:', error);
  }
}

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

    let event;
    try {
      // Using asynchronous constructEventAsync instead of synchronous constructEvent
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('Event constructed successfully:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Store webhook event in database
    await logWebhookEvent(
      event.type,
      event.id,
      event.data.object.metadata?.payment_id,
      event,
      !event.livemode
    );

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object));
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata || {}));

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

    // Mark webhook as processed
    await markWebhookProcessed(event.id);

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
