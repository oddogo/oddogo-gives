
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";
import { recordPaymentLog } from "../../utils/db.ts";
import { findPaymentByIntentId, findPaymentById, updatePaymentSuccess, updatePaymentFailed } from "./payment-utils.ts";

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
    let payment = await findPaymentByIntentId(paymentIntentId);
    
    // If not found, try finding by our internal payment_id from metadata
    if (!payment) {
      console.log(`Payment not found by intent ID, trying internal payment_id: ${paymentId}`);
      
      if (paymentId && paymentId !== 'none') {
        payment = await findPaymentById(paymentId);
        
        if (!payment) {
          console.error(`Could not find payment with ID: ${paymentId}`);
          await recordPaymentLog(paymentId, 'payment_not_found', `Payment record not found for ID: ${paymentId}`, {
            payment_intent_id: paymentIntentId,
            error: 'No error details'
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
    const result = await updatePaymentSuccess(payment.id, paymentIntent);
    
    if (!result.success) {
      throw new Error(result.error || "Unknown error updating payment");
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
      error: error.message || "Unknown error",
      payment_intent_id: paymentIntentId
    });
    return { success: false, error: error.message || "Unknown error" };
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
    let payment = await findPaymentByIntentId(paymentIntentId);
    
    if (!payment) {
      if (paymentId && paymentId !== 'none') {
        payment = await findPaymentById(paymentId);
        
        if (!payment) {
          console.error(`Could not find payment with ID: ${paymentId}`);
          await recordPaymentLog(paymentId, 'payment_not_found', `Payment record not found for ID: ${paymentId}`, {
            payment_intent_id: paymentIntentId,
            error: 'No error details' 
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
    const result = await updatePaymentFailed(payment.id, paymentIntent, lastPaymentError);
    
    if (!result.success) {
      throw new Error(result.error || "Unknown error updating payment");
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
      error: error.message || "Unknown error",
      payment_intent_id: paymentIntentId
    });
    return { success: false, error: error.message || "Unknown error" };
  }
};
