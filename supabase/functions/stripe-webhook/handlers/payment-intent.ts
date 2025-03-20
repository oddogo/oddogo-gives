
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";
import { supabaseClient, recordPaymentLog } from "../utils/db.ts";

// Handler for payment_intent.succeeded events
export const handlePaymentIntentSucceeded = async (event: Stripe.Event) => {
  console.log("Processing payment_intent.succeeded event");
  
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;
  const chargeId = paymentIntent.latest_charge as string;
  const metadata = paymentIntent.metadata || {};
  const paymentId = metadata.payment_id || 'none';
  
  try {
    await recordPaymentLog(paymentId, 'payment_intent_succeeded', 'Payment intent succeeded', {
      payment_intent_id: paymentIntentId,
      charge_id: chargeId,
      metadata
    });
    
    console.log(`Processing payment intent succeeded for payment_id: ${paymentId}, intent_id: ${paymentIntentId}`);
    
    // First try to find the payment by payment_intent_id
    let { data: payment, error: fetchError } = await supabaseClient
      .from('stripe_payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    
    // If not found, try finding by our internal payment_id from metadata
    if (fetchError || !payment) {
      console.log(`Payment not found by intent ID, trying internal payment_id: ${paymentId}`);
      
      if (paymentId && paymentId !== 'none') {
        const { data: paymentByInternalId, error: internalIdFetchError } = await supabaseClient
          .from('stripe_payments')
          .select('*')
          .eq('id', paymentId)
          .maybeSingle();
          
        if (!internalIdFetchError && paymentByInternalId) {
          payment = paymentByInternalId;
          console.log(`Found payment by internal ID: ${paymentId}`);
        } else {
          console.error(`Could not find payment with ID: ${paymentId}`, internalIdFetchError);
          await recordPaymentLog(paymentId, 'payment_not_found', `Payment record not found for ID: ${paymentId}`, {
            payment_intent_id: paymentIntentId,
            error: internalIdFetchError?.message || 'No error details'
          });
          return { success: false, error: "Payment record not found" };
        }
      } else {
        console.error('No payment ID in metadata and could not find by payment intent ID');
        await recordPaymentLog('unknown', 'payment_not_found', 'No payment ID in metadata and could not find by payment intent ID', {
          payment_intent_id: paymentIntentId
        });
        return { success: false, error: "Payment record not found" };
      }
    }
    
    console.log(`Updating payment record ${payment.id} to completed status`);
    
    // Update the payment record with the final success status
    const { error: updateError } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_method_id: paymentIntent.payment_method as string,
        stripe_charge_id: chargeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);
      
    if (updateError) {
      console.error('Error updating payment record:', updateError);
      await recordPaymentLog(payment.id, 'update_error', 'Failed to update payment record', {
        error: updateError.message,
        payment_id: payment.id
      });
      throw updateError;
    }
    
    console.log(`Successfully marked payment ${payment.id} as completed`);
    await recordPaymentLog(payment.id, 'payment_completed', 'Payment successfully marked as completed', {
      payment_id: payment.id,
      payment_intent_id: paymentIntentId
    });
    
    return { success: true, message: "Payment marked as completed" };
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    await recordPaymentLog(paymentId, 'payment_intent_error', 'Error handling payment intent succeeded', {
      error: error.message,
      payment_intent_id: paymentIntentId
    });
    return { success: false, error: error.message };
  }
};

// Handler for payment_intent.payment_failed events
export const handlePaymentIntentFailed = async (event: Stripe.Event) => {
  console.log("Processing payment_intent.payment_failed event");
  
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;
  const metadata = paymentIntent.metadata || {};
  const paymentId = metadata.payment_id || 'none';
  const lastPaymentError = paymentIntent.last_payment_error?.message || 'Unknown error';
  
  try {
    await recordPaymentLog(paymentId, 'payment_intent_failed', 'Payment intent failed', {
      payment_intent_id: paymentIntentId,
      last_payment_error: lastPaymentError,
      metadata
    });
    
    // Find the payment by payment_intent_id or internal payment_id
    let { data: payment, error: fetchError } = await supabaseClient
      .from('stripe_payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    
    if (fetchError || !payment) {
      if (paymentId && paymentId !== 'none') {
        const { data: paymentByInternalId, error: internalIdFetchError } = await supabaseClient
          .from('stripe_payments')
          .select('*')
          .eq('id', paymentId)
          .maybeSingle();
          
        if (!internalIdFetchError && paymentByInternalId) {
          payment = paymentByInternalId;
          console.log(`Found payment by internal ID: ${paymentId}`);
        } else {
          console.error(`Could not find payment with ID: ${paymentId}`, internalIdFetchError);
          await recordPaymentLog(paymentId, 'payment_not_found', `Payment record not found for ID: ${paymentId}`, {
            payment_intent_id: paymentIntentId,
            error: internalIdFetchError?.message || 'No error details' 
          });
          return { success: false, error: "Payment record not found" };
        }
      } else {
        console.error('No payment ID in metadata and could not find by payment intent ID');
        await recordPaymentLog('unknown', 'payment_not_found', 'No payment ID in metadata and could not find by payment intent ID', {
          payment_intent_id: paymentIntentId
        });
        return { success: false, error: "Payment record not found" };
      }
    }
    
    console.log(`Updating payment record ${payment.id} to failed status`);
    
    // Update the payment record to reflect the failure
    const { error: updateError } = await supabaseClient
      .from('stripe_payments')
      .update({
        status: 'failed',
        message: `Payment failed: ${lastPaymentError}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);
      
    if (updateError) {
      console.error('Error updating payment record to failed status:', updateError);
      await recordPaymentLog(payment.id, 'update_error', 'Failed to update payment record to failed status', {
        error: updateError.message,
        payment_id: payment.id
      });
      throw updateError;
    }
    
    console.log(`Marked payment ${payment.id} as failed`);
    await recordPaymentLog(payment.id, 'payment_failed', 'Payment marked as failed', {
      payment_id: payment.id,
      payment_intent_id: paymentIntentId,
      reason: lastPaymentError
    });
    
    return { success: true, message: "Payment marked as failed" };
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    await recordPaymentLog(paymentId, 'payment_failed_error', 'Error handling payment intent failed event', {
      error: error.message,
      payment_intent_id: paymentIntentId
    });
    return { success: false, error: error.message };
  }
};
