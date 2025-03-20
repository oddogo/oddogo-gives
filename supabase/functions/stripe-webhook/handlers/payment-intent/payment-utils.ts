
import { supabaseClient, recordPaymentLog } from "../../utils/db.ts";

/**
 * Find a payment record by payment intent ID
 */
export async function findPaymentByIntent(paymentIntentId: string) {
  console.log(`Looking for payment with intent ID: ${paymentIntentId}`);
  
  const { data: payment, error: fetchError } = await supabaseClient
    .from('stripe_payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  
  if (fetchError) {
    console.error(`Error finding payment by intent ID: ${fetchError.message}`);
    return null;
  }
  
  if (payment) {
    console.log(`Found payment with ID: ${payment.id} by intent ID`);
  } else {
    console.log(`No payment found with intent ID: ${paymentIntentId}`);
  }
  
  return payment;
}

/**
 * Find a payment record by internal payment ID
 */
export async function findPaymentById(paymentId: string) {
  console.log(`Looking for payment with internal ID: ${paymentId}`);
  
  const { data: payment, error: internalIdFetchError } = await supabaseClient
    .from('stripe_payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();
    
  if (internalIdFetchError) {
    console.error(`Error finding payment by internal ID: ${internalIdFetchError.message}`);
    return null;
  }
  
  if (payment) {
    console.log(`Found payment with ID: ${payment.id} by internal ID`);
  } else {
    console.log(`No payment found with internal ID: ${paymentId}`);
  }
  
  return payment;
}

/**
 * Update payment record to completed status
 */
export async function updatePaymentSuccess(paymentId: string, paymentIntentId: string, paymentMethodId: string, chargeId: string) {
  try {
    const { error: updateError } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_method_id: paymentMethodId,
        stripe_charge_id: chargeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (updateError) {
      console.error('Error updating payment record:', updateError);
      await recordPaymentLog(paymentId, 'update_error', 'Failed to update payment record', {
        error: updateError.message,
        payment_id: paymentId
      });
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating payment success: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Update payment record to failed status
 */
export async function updatePaymentFailed(paymentId: string, errorMessage: string) {
  try {
    const { error: updateError } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'failed',
        message: `Payment failed: ${errorMessage}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (updateError) {
      console.error('Error updating payment record to failed status:', updateError);
      await recordPaymentLog(paymentId, 'update_error', 'Failed to update payment record to failed status', {
        error: updateError.message,
        payment_id: paymentId
      });
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating payment failed status: ${error.message}`);
    return { success: false, error: error.message };
  }
}
