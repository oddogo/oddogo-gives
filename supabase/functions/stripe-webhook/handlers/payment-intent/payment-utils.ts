
import { supabaseClient, recordPaymentLog } from "../../utils/db.ts";

/**
 * Finds a payment record by payment intent ID
 */
export async function findPaymentByIntentId(paymentIntentId: string) {
  if (!paymentIntentId) {
    console.error('Missing payment intent ID in findPaymentByIntentId function');
    return null;
  }

  const { data: payment, error } = await supabaseClient
    .from('stripe_payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
    
  if (error) {
    console.error(`Error finding payment with payment intent ID ${paymentIntentId}:`, error);
    return null;
  }
  
  if (!payment) {
    console.log(`No payment found with payment intent ID: ${paymentIntentId}`);
  } else {
    console.log(`Found payment with ID ${payment.id} for payment intent ${paymentIntentId}`);
  }
  
  return payment;
}

/**
 * Finds a payment record by internal payment ID
 */
export async function findPaymentById(paymentId: string) {
  if (!paymentId) {
    console.error('Missing payment ID in findPaymentById function');
    return null;
  }

  const { data: payment, error } = await supabaseClient
    .from('stripe_payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();
    
  if (error) {
    console.error(`Error finding payment with ID ${paymentId}:`, error);
    return null;
  }
  
  if (!payment) {
    console.log(`No payment found with ID: ${paymentId}`);
  } else {
    console.log(`Found payment with ID ${paymentId}`);
  }
  
  return payment;
}

/**
 * Updates a payment record with successful payment info
 */
export async function updatePaymentSuccess(paymentId: string, paymentIntent: any) {
  console.log(`Updating payment ${paymentId} status to completed`);
  
  try {
    const { error } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'completed',
        stripe_charge_id: paymentIntent.latest_charge || null,
        stripe_payment_method_id: paymentIntent.payment_method || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (error) {
      console.error(`Error updating payment ${paymentId} to completed:`, error);
      await recordPaymentLog(paymentId, 'update_error', 'Failed to update payment to completed', {
        error: error.message
      });
      throw error;
    }
    
    await recordPaymentLog(paymentId, 'payment_completed', 'Payment processed successfully', {
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100 // Convert to pounds for logging purposes only
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating payment ${paymentId}:`, error);
    throw error;
  }
}

/**
 * Updates a payment record with failed payment info
 */
export async function updatePaymentFailed(paymentId: string, paymentIntent: any, errorMessage: string) {
  console.log(`Updating payment ${paymentId} status to failed`);
  
  try {
    const { error } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (error) {
      console.error(`Error updating payment ${paymentId} to failed:`, error);
      await recordPaymentLog(paymentId, 'update_error', 'Failed to update payment to failed', {
        error: error.message
      });
      throw error;
    }
    
    await recordPaymentLog(paymentId, 'payment_failed', errorMessage, {
      payment_intent_id: paymentIntent.id,
      last_payment_error: paymentIntent.last_payment_error
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating failed payment ${paymentId}:`, error);
    throw error;
  }
}

