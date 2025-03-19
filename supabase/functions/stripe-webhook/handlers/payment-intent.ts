
import { supabaseClient } from '../utils/db.ts';

export const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  console.log('Processing payment_intent.succeeded event');
  console.log('Payment Intent metadata:', JSON.stringify(paymentIntent.metadata || {}, null, 2));
  
  const paymentId = paymentIntent.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in payment intent metadata. Full payment intent:', JSON.stringify(paymentIntent, null, 2));
    
    // Try to find the payment by payment_intent_id as fallback
    console.log('Attempting to find payment by payment_intent_id:', paymentIntent.id);
    const { data: paymentByIntentId, error: findError } = await supabaseClient
      .from('stripe_payments')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle();
      
    if (findError || !paymentByIntentId) {
      console.error('Unable to find payment by payment_intent_id:', findError || 'No payment found');
      return;
    }
    
    console.log('Found payment by payment_intent_id:', paymentByIntentId.id);
    return handlePaymentSuccessById(paymentByIntentId.id, paymentIntent);
  }

  return handlePaymentSuccessById(paymentId, paymentIntent);
};

const handlePaymentSuccessById = async (paymentId: string, paymentIntent: any) => {
  try {
    // Find the payment charge
    const chargeId = paymentIntent.latest_charge;
    console.log('Latest charge ID:', chargeId);

    // Get payment method details if available
    const paymentMethodId = paymentIntent.payment_method;
    console.log('Payment method ID:', paymentMethodId);

    console.log('Updating payment record with completed status and charge details');
    
    // Update payment record with successful payment data
    // Remove the completed_at field since it doesn't exist in the database schema
    const updateData: any = {
      status: 'completed'
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
    
    // If this payment is connected to a campaign, ensure it's properly linked
    if (paymentIntent.metadata?.campaign_id) {
      const { data: existingLink, error: checkError } = await supabaseClient
        .from('campaign_payments')
        .select('id')
        .eq('payment_id', paymentId)
        .eq('campaign_id', paymentIntent.metadata.campaign_id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing campaign link:', checkError);
      } else if (!existingLink) {
        // Only create the link if it doesn't exist
        const { error: campaignError } = await supabaseClient
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
    console.error('Exception in handlePaymentSuccessById:', error);
  }
};

export const handlePaymentIntentFailed = async (paymentIntent: any) => {
  console.log('Processing payment_intent.payment_failed event');
  console.log('Payment Intent metadata:', JSON.stringify(paymentIntent.metadata || {}, null, 2));
  
  let paymentId = paymentIntent.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in payment intent metadata. Full payment intent:', JSON.stringify(paymentIntent, null, 2));
    
    // Try to find the payment by payment_intent_id as fallback
    console.log('Attempting to find payment by payment_intent_id:', paymentIntent.id);
    const { data: paymentByIntentId, error: findError } = await supabaseClient
      .from('stripe_payments')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .maybeSingle();
      
    if (findError || !paymentByIntentId) {
      console.error('Unable to find payment by payment_intent_id:', findError || 'No payment found');
      return;
    }
    
    console.log('Found payment by payment_intent_id:', paymentByIntentId.id);
    paymentId = paymentByIntentId.id;
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
