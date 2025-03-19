
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { StripeEvent } from './types.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export { supabaseClient };

export const storeWebhookEvent = async (event: StripeEvent) => {
  // Extract campaign_id from metadata if it exists
  const metadata = event.data.object.metadata || {};
  const paymentId = metadata.payment_id;
  const campaignId = metadata.campaign_id;
  
  console.log('Storing webhook event with metadata:', metadata);
  
  const { error } = await supabaseClient
    .from('stripe_webhook_events')
    .insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payment_id: paymentId,
      status: 'received',
      raw_event: event,
      is_test: !event.livemode
    });

  if (error) {
    console.error('Error storing webhook event:', error);
    throw new Error('Failed to store webhook event');
  }
  
  console.log('Successfully stored webhook event:', event.id);
  
  // If we have a payment_id and campaign_id, log it separately
  if (paymentId && campaignId) {
    await logPaymentActivity(
      paymentId,
      { event_id: event.id, event_type: event.type, campaign_id: campaignId },
      'webhook_received',
      `Webhook ${event.type} received with campaign_id: ${campaignId}`
    );
  }
};

export const markWebhookAsProcessed = async (eventId: string) => {
  const { error } = await supabaseClient
    .from('stripe_webhook_events')
    .update({ 
      status: 'processed',
      processed_at: new Date().toISOString()
    })
    .eq('stripe_event_id', eventId);

  if (error) {
    console.error('Error marking webhook as processed:', error);
    throw new Error('Failed to mark webhook as processed');
  }
  
  console.log('Successfully marked webhook as processed:', eventId);
};

export const findPaymentByIntentId = async (intentId: string) => {
  const { data, error } = await supabaseClient
    .from('stripe_payments')
    .select('id, campaign_id')
    .eq('stripe_payment_intent_id', intentId)
    .maybeSingle();
  
  if (error) {
    console.error('Error looking up payment by intent ID:', error);
    return null;
  }
  
  if (data) {
    console.log(`Found payment ${data.id} with campaign_id: ${data.campaign_id || 'None'}`);
  }
  
  return data;
};

export const getPayment = async (paymentId: string) => {
  const { data, error } = await supabaseClient
    .from('stripe_payments')
    .select('campaign_id, stripe_payment_intent_id, fingerprint_id')
    .eq('id', paymentId)
    .single();
  
  if (error) {
    console.error('Error retrieving payment record:', error);
    return null;
  }
  
  console.log(`Retrieved payment ${paymentId} with campaign_id: ${data.campaign_id || 'None'}`);
  return data;
};

export const updatePaymentWithSession = async (paymentId: string, updateData: any) => {
  // Log the actual update data for debugging
  console.log(`Updating payment ${paymentId} with session data:`, updateData);
  
  const { error } = await supabaseClient
    .from('stripe_payments')
    .update(updateData)
    .eq('id', paymentId);

  if (error) {
    console.error('Error updating payment record:', error);
    throw new Error('Failed to update payment record');
  }

  console.log('Successfully updated payment with Stripe session details');
  
  // Get the updated record to verify
  const { data: updatedPayment } = await supabaseClient
    .from('stripe_payments')
    .select('campaign_id')
    .eq('id', paymentId)
    .single();
    
  console.log(`Payment ${paymentId} now has campaign_id: ${updatedPayment?.campaign_id || 'None'}`);
};

export const updatePaymentStatus = async (paymentId: string, updateData: any) => {
  // Log the actual update data for debugging
  console.log(`Updating payment ${paymentId} status with data:`, updateData);
  
  const { data, error } = await supabaseClient
    .from('stripe_payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }

  console.log('Successfully updated payment status:', data);
  return data;
};

export const logPaymentActivity = async (paymentId: string, metadata: any, status: string, message: string) => {
  // Ensure campaign_id is included in metadata if it exists
  const { error } = await supabaseClient
    .from('stripe_payment_logs')
    .insert({
      payment_id: paymentId,
      metadata,
      status,
      message
    });

  if (error) {
    console.error(`Error logging payment ${status}:`, error);
    // We don't throw here to avoid failing the webhook on just logging issues
  } else {
    console.log(`Successfully logged payment ${status} with metadata:`, metadata);
  }
};

export const checkCampaignPaymentExists = async (campaignId: string, paymentId: string) => {
  console.log(`Checking if campaign payment link exists for campaign ${campaignId}, payment ${paymentId}`);
  
  const { data, error } = await supabaseClient
    .from('campaign_payments')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('payment_id', paymentId)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking existing campaign payment link:', error);
    return false;
  }
  
  const exists = !!data;
  console.log(`Campaign payment link exists: ${exists}`);
  return exists;
};

export const createCampaignPayment = async (campaignId: string, paymentId: string) => {
  const exists = await checkCampaignPaymentExists(campaignId, paymentId);
  
  if (exists) {
    console.log('Campaign payment link already exists, skipping creation');
    return;
  }
  
  console.log(`Creating campaign payment link: campaign ${campaignId}, payment ${paymentId}`);
  
  const { data, error } = await supabaseClient
    .from('campaign_payments')
    .insert({
      campaign_id: campaignId,
      payment_id: paymentId
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating campaign payment link:', error);
    // We don't throw here to avoid failing the webhook just because of a link issue
  } else {
    console.log('Successfully created campaign payment link:', data);
  }
};
