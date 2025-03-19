
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to log webhook events
export const logWebhookEvent = async (event: any) => {
  console.log('Logging webhook event:', { 
    eventType: event.type, 
    eventId: event.id, 
    isTestMode: event.livemode === false 
  });

  try {
    // Extract payment ID from metadata if available
    const metadata = event.data?.object?.metadata || {};
    const paymentId = metadata.payment_id || null;
    
    const { error } = await supabaseClient
      .from('stripe_webhook_logs')
      .insert({
        event_type: event.type,
        event_id: event.id,
        payment_id: paymentId,
        event_data: JSON.parse(JSON.stringify(event)),
        is_test: event.livemode === false,
        status: 'received'
      });

    if (error) {
      console.error('Error logging webhook event:', error);
      throw new Error(`Failed to log webhook event: ${error.message || 'Unknown database error'}`);
    } else {
      console.log('Webhook event logged successfully');
    }
  } catch (error) {
    console.error('Exception in logWebhookEvent:', error);
    // Don't throw here to prevent stopping the webhook processing flow
  }
};

// Helper function to mark webhooks as processed
export const markWebhookProcessed = async (eventId: string, success = true, errorMessage?: string) => {
  console.log('Marking webhook as processed:', eventId, success ? 'success' : 'failed');

  try {
    // First, check if the record exists
    const { data: existingRecord, error: checkError } = await supabaseClient
      .from('stripe_webhook_logs')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking if webhook exists:', checkError);
      throw new Error(`Failed to check if webhook exists: ${checkError.message || 'Unknown database error'}`);
    }
    
    if (!existingRecord) {
      console.warn(`No webhook record found with event_id: ${eventId}, skipping update`);
      return; // Exit early if no record exists, don't throw an error
    }
    
    // Now update the record
    const { error } = await supabaseClient
      .from('stripe_webhook_logs')
      .update({ 
        status: success ? 'processed' : 'failed',
        processed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('event_id', eventId);

    if (error) {
      console.error('Error marking webhook as processed:', error);
      throw new Error(`Failed to mark webhook as processed: ${error.message || 'Unknown database error'}`);
    } else {
      console.log('Webhook marked as processed successfully');
    }
  } catch (error) {
    // Safely handle any error object, ensuring we don't try to access properties that don't exist
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exception in markWebhookProcessed:', errorMessage);
    // Don't throw here to prevent stopping the webhook processing flow
  }
};

// Helper function to record payment logs
export const recordPaymentLog = async (paymentId: string, status: string, message: string, metadata?: any) => {
  console.log(`Recording payment log: ${status} - ${message} for payment ${paymentId}`);
  
  try {
    // Make sure we're not trying to use 'none' as a UUID
    const validPaymentId = paymentId && paymentId !== 'none' ? paymentId : null;
    
    const { error } = await supabaseClient
      .from('stripe_payment_logs')
      .insert({
        payment_id: validPaymentId,
        status,
        message,
        metadata
      });

    if (error) {
      console.error('Error recording payment log:', error);
    }
  } catch (error) {
    console.error('Exception recording payment log:', error);
  }
};

// Export supabaseClient only once (removing the duplicate export)
export { supabaseClient };
