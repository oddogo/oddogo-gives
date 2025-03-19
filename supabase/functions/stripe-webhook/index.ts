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
      });

    if (webhookError) {
      console.error('Error storing webhook event:', webhookError);
      // Continue processing despite the error
    }

    console.log('Processing webhook event:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object));
    console.log('Event metadata:', JSON.stringify(event.data.object.metadata || {}));

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;
        const campaignId = session.metadata?.campaign_id;
        const fingerprintId = session.metadata?.fingerprint_id;
        const message = session.metadata?.message;
        
        console.log('Processing checkout session completed:', paymentId);
        console.log('Session details:', {
          id: session.id,
          email: session.customer_email,
          customer: session.customer,
          payment_intent: session.payment_intent,
          payment_method: session.payment_method,
          campaignId: campaignId || 'none',
          fingerprintId: fingerprintId || 'none',
          message: message || 'none'
        });
        
        if (paymentId) {
          // Get the existing payment record first to preserve any existing data
          const { data: existingPayment } = await supabaseClient
            .from('stripe_payments')
            .select('*')
            .eq('id', paymentId)
            .maybeSingle();
          
          if (!existingPayment) {
            console.warn(`Payment with ID ${paymentId} not found in database`);
          }
          
          // Prepare the update fields, using existing data as fallback
          const updateFields = {
            stripe_payment_intent_id: session.payment_intent,
            stripe_payment_method_id: session.payment_method,
            stripe_payment_email: session.customer_email || existingPayment?.stripe_payment_email,
            stripe_customer_id: session.customer,
            message: message || existingPayment?.message || '',
            updated_at: new Date().toISOString()
          };
          
          // Ensure we don't lose fingerprint_id
          if (fingerprintId) {
            updateFields['fingerprint_id'] = fingerprintId;
          } else if (existingPayment?.fingerprint_id) {
            // Keep the existing fingerprint_id if available
            console.log(`Using existing fingerprint_id ${existingPayment.fingerprint_id}`);
          } else {
            console.warn('No fingerprint_id found in session metadata or existing payment');
          }
          
          const { data: updatedPayment, error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update(updateFields)
            .eq('id', paymentId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating payment record:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment record' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully updated payment with Stripe session details:', updatedPayment);

          // Handle campaign payment if campaign_id is present
          if (campaignId) {
            await createOrVerifyCampaignPayment(campaignId, paymentId);
          }
        } else {
          console.log('No payment ID in session metadata, skipping database update');
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        const campaignId = paymentIntent.metadata?.campaign_id;
        const fingerprintId = paymentIntent.metadata?.fingerprint_id;
        const message = paymentIntent.metadata?.message;
        
        console.log('Processing successful payment intent:', paymentIntent.id);
        console.log('Payment details:', {
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentIntent.payment_method,
          charge_id: paymentIntent.latest_charge,
          metadata: paymentIntent.metadata || {},
          fingerprintId: fingerprintId || 'none',
          message: message || 'none'
        });
        
        // If no paymentId in metadata, try to find by payment intent ID
        if (!paymentId) {
          console.log('No payment ID in metadata, trying to find by intent ID');
          
          const { data: paymentByIntent, error: findError } = await supabaseClient
            .from('stripe_payments')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .maybeSingle();
            
          if (findError) {
            console.error('Error looking up payment by intent ID:', findError);
          } else if (paymentByIntent) {
            console.log(`Found payment record ${paymentByIntent.id} by intent ID`);
            
            // Prepare update data
            const updateData = { 
              status: 'completed',
              stripe_payment_method_id: paymentIntent.payment_method || paymentByIntent.stripe_payment_method_id,
              stripe_charge_id: paymentIntent.latest_charge,
              message: message || paymentByIntent.message || '',
              updated_at: new Date().toISOString()
            };
            
            // Ensure we don't lose fingerprint_id
            if (fingerprintId) {
              updateData['fingerprint_id'] = fingerprintId;
            } else if (paymentByIntent.fingerprint_id) {
              // Keep existing
              console.log(`Keeping existing fingerprint_id ${paymentByIntent.fingerprint_id}`);
            } else {
              console.warn('No fingerprint_id found in metadata or existing payment');
            }
            
            // Update the payment record
            const { error: updateError } = await supabaseClient
              .from('stripe_payments')
              .update(updateData)
              .eq('id', paymentByIntent.id);

            if (updateError) {
              console.error('Error updating payment by intent ID:', updateError);
              return new Response(
                JSON.stringify({ error: 'Failed to update payment record' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
            
            console.log(`Successfully updated payment ${paymentByIntent.id} to completed`);
            
            // Handle campaign ID if present
            if (campaignId) {
              await createOrVerifyCampaignPayment(campaignId, paymentByIntent.id);
            }
            
            // Log the payment status update
            await supabaseClient
              .from('stripe_payment_logs')
              .insert({
                payment_id: paymentByIntent.id,
                metadata: {
                  payment_intent_id: paymentIntent.id,
                  payment_method_id: paymentIntent.payment_method,
                  charge_id: paymentIntent.latest_charge,
                  fingerprint_id: fingerprintId || paymentByIntent.fingerprint_id,
                  message: message || paymentByIntent.message
                },
                status: 'completed',
                message: 'Payment completed successfully (found by intent ID)'
              });
          } else {
            console.log('No matching payment record found for intent ID:', paymentIntent.id);
          }
        } else {
          // Get the existing payment to preserve data
          const { data: existingPayment } = await supabaseClient
            .from('stripe_payments')
            .select('*')
            .eq('id', paymentId)
            .maybeSingle();
          
          if (!existingPayment) {
            console.warn(`Payment with ID ${paymentId} not found in database`);
          }
          
          // Prepare update data with fallbacks to existing data
          const updateData = { 
            status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            stripe_payment_method_id: paymentIntent.payment_method || existingPayment?.stripe_payment_method_id,
            stripe_charge_id: paymentIntent.latest_charge,
            message: message || existingPayment?.message || '',
            updated_at: new Date().toISOString()
          };
          
          // Ensure we don't lose fingerprint_id
          if (fingerprintId) {
            updateData['fingerprint_id'] = fingerprintId;
          } else if (existingPayment?.fingerprint_id) {
            console.log(`Keeping existing fingerprint_id ${existingPayment.fingerprint_id}`);
          } else {
            console.warn('No fingerprint_id found in metadata or existing payment');
          }
          
          // Update the payment record
          const { data: updatedPayment, error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update(updateData)
            .eq('id', paymentId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating payment status:', updateError);
            return new Response(
              JSON.stringify({ error: 'Failed to update payment status' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Successfully updated payment status to completed:', updatedPayment);

          // If a campaign ID is in metadata, handle it
          if (campaignId) {
            await createOrVerifyCampaignPayment(campaignId, paymentId);
          }

          // Log the payment status update
          const { error: logError } = await supabaseClient
            .from('stripe_payment_logs')
            .insert({
              payment_id: paymentId,
              metadata: {
                payment_intent_id: paymentIntent.id,
                payment_method_id: paymentIntent.payment_method,
                charge_id: paymentIntent.latest_charge,
                campaign_id: campaignId || null,
                fingerprint_id: fingerprintId || existingPayment?.fingerprint_id,
                message: message || existingPayment?.message
              },
              status: 'completed',
              message: 'Payment completed successfully'
            });

          if (logError) {
            console.error('Error logging payment status:', logError);
          } else {
            console.log('Successfully logged payment completion');
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata?.payment_id;
        const fingerprintId = paymentIntent.metadata?.fingerprint_id;
        const message = paymentIntent.metadata?.message;
        
        console.log('Processing failed payment:', paymentId || paymentIntent.id);
        
        // Similar to the succeeded case, try to find by intent ID if no metadata
        if (!paymentId) {
          const { data: paymentByIntent, error: findError } = await supabaseClient
            .from('stripe_payments')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .maybeSingle();
            
          if (!findError && paymentByIntent) {
            const updateData = { 
              status: 'failed',
              message: message || paymentByIntent.message || '',
              updated_at: new Date().toISOString()
            };
            
            // Ensure we don't lose fingerprint_id
            if (fingerprintId) {
              updateData['fingerprint_id'] = fingerprintId;
            }
            
            await supabaseClient
              .from('stripe_payments')
              .update(updateData)
              .eq('id', paymentByIntent.id);
              
            console.log(`Updated payment ${paymentByIntent.id} to failed status`);
            
            await supabaseClient
              .from('stripe_payment_logs')
              .insert({
                payment_id: paymentByIntent.id,
                metadata: {
                  ...paymentIntent,
                  fingerprint_id: fingerprintId || paymentByIntent.fingerprint_id,
                  message: message || paymentByIntent.message
                },
                status: 'failed',
                message: paymentIntent.last_payment_error?.message || 'Payment failed'
              });
          } else {
            console.log('No matching payment record found for failed intent:', paymentIntent.id);
          }
        } else if (paymentId) {
          // Get existing payment to preserve data
          const { data: existingPayment } = await supabaseClient
            .from('stripe_payments')
            .select('*')
            .eq('id', paymentId)
            .maybeSingle();
          
          // Prepare update data
          const updateData = { 
            status: 'failed',
            message: message || existingPayment?.message || '',
            updated_at: new Date().toISOString()
          };
          
          // Preserve fingerprint_id
          if (fingerprintId) {
            updateData['fingerprint_id'] = fingerprintId;
          }
          
          const { error: updateError } = await supabaseClient
            .from('stripe_payments')
            .update(updateData)
            .eq('id', paymentId);

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
              metadata: {
                ...paymentIntent,
                fingerprint_id: fingerprintId || existingPayment?.fingerprint_id,
                message: message || existingPayment?.message
              },
              status: 'failed',
              message: paymentIntent.last_payment_error?.message || 'Payment failed'
            });

          if (logError) {
            console.error('Error logging payment failure:', logError);
          } else {
            console.log('Successfully logged payment failure');
          }
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
      .eq('stripe_event_id', event.id);

    if (processedError) {
      console.error('Error marking webhook as processed:', processedError);
    } else {
      console.log('Successfully marked webhook as processed');
    }

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

// Helper function to reliably create or verify a campaign payment
async function createOrVerifyCampaignPayment(campaignId: string, paymentId: string) {
  try {
    console.log(`Creating/verifying campaign payment relation for campaign ${campaignId} and payment ${paymentId}`);
    
    // First check if the campaign exists
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .maybeSingle();
      
    if (campaignError || !campaign) {
      console.error('Campaign not found or error:', campaignError);
      return;
    }
    
    // Next check if the payment exists
    const { data: payment, error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .select('id, status')
      .eq('id', paymentId)
      .maybeSingle();
      
    if (paymentError || !payment) {
      console.error('Payment not found or error:', paymentError);
      return;
    }
    
    // Only create campaign payment relation if payment status is completed
    if (payment.status !== 'completed') {
      console.log(`Payment ${paymentId} status is ${payment.status}, not creating campaign payment relation yet`);
      return;
    }
    
    // First check if the relation already exists
    const { data: existingRelation, error: relationError } = await supabaseClient
      .from('campaign_payments')
      .select('id')
      .match({
        campaign_id: campaignId,
        payment_id: paymentId
      })
      .maybeSingle();
    
    if (relationError) {
      console.error('Error checking existing campaign payment relation:', relationError);
      return;
    }
    
    if (existingRelation) {
      console.log('Campaign payment relation already exists:', existingRelation);
      return;
    }
    
    // Create the relation if it doesn't exist
    const { data: newRelation, error: createError } = await supabaseClient
      .from('campaign_payments')
      .insert({
        campaign_id: campaignId,
        payment_id: paymentId
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating campaign payment record:', createError);
      throw new Error(`Failed to create campaign payment: ${createError.message}`);
    } else {
      console.log('Successfully created campaign payment record:', newRelation);
    }
  } catch (err) {
    console.error('Exception handling campaign payment:', err);
    // Log the error but don't throw to prevent the webhook from failing
  }
}
