
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export const logWebhookEvent = async (eventType: string, eventId: string, paymentId: string | null, eventData: any, isTestMode: boolean) => {
  console.log('Logging webhook event:', { eventType, eventId, paymentId, isTestMode });

  try {
    const { error } = await supabaseClient
      .from('stripe_webhook_logs')
      .insert({
        event_type: eventType,
        event_id: eventId,
        payment_id: paymentId,
        event_data: eventData,
        is_test: isTestMode
      });

    if (error) {
      console.error('Error logging webhook event:', error);
    } else {
      console.log('Webhook event logged successfully');
    }
  } catch (error) {
    console.error('Exception in logWebhookEvent:', error);
  }
};

export const markWebhookProcessed = async (eventId: string) => {
  console.log('Marking webhook as processed:', eventId);

  try {
    const { error } = await supabaseClient
      .from('stripe_webhook_logs')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', eventId);

    if (error) {
      console.error('Error marking webhook as processed:', error);
    } else {
      console.log('Webhook marked as processed successfully');
    }
  } catch (error) {
    console.error('Exception in markWebhookProcessed:', error);
  }
};

export const handleCheckoutSessionCompleted = async (session: any) => {
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
    const { data, error } = await supabaseClient
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
      
      const { error: campaignError } = await supabaseClient
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
    }
  } catch (error) {
    console.error('Exception in handleCheckoutSessionCompleted:', error);
  }
};

export const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
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

    const { data, error } = await supabaseClient
      .from('stripe_payments')
      .update(updateData)
      .eq('id', paymentId)
      .select();

    if (error) {
      console.error('Error updating payment with successful status:', error);
      return;
    }

    console.log('Payment marked as completed successfully:', data);
  } catch (error) {
    console.error('Exception in handlePaymentIntentSucceeded:', error);
  }
};

export const handlePaymentIntentFailed = async (paymentIntent: any) => {
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
    const { data, error } = await supabaseClient
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
};
