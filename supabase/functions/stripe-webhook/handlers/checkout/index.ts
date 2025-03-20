
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";
import { recordPaymentLog } from "../../utils/db.ts";
import { findPaymentRecord, updateExistingPayment, createNewPayment } from "./payment-utils.ts";
import { linkPaymentToCampaign } from "./campaign-utils.ts";

// Handler for checkout.session.completed events
export const handleCheckoutSessionCompleted = async (event: Stripe.Event) => {
  console.log("Processing checkout.session.completed event");
  
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntentId = session.payment_intent as string;
  const sessionId = session.id;
  
  // Extract our custom metadata
  const metadata = session.metadata || {};
  const paymentId = metadata.payment_id || 'none';
  const fingerprintId = metadata.fingerprint_id;
  const campaignId = metadata.campaign_id;
  const userId = metadata.user_id;
  
  try {
    console.log(`Processing checkout session completed for payment_id: ${paymentId}, session_id: ${sessionId}`);
    
    await recordPaymentLog(paymentId, 'checkout_completed', 'Checkout session completed', {
      session_id: sessionId,
      payment_intent_id: paymentIntentId,
      metadata
    });
    
    // Find existing payment record
    const existingPayment = await findPaymentRecord(sessionId, paymentId);
    
    // If we found a payment, update it with the Stripe information
    if (existingPayment) {
      console.log(`Found existing payment record ${existingPayment.id}`);
      
      // Update the payment with checkout session info
      await updateExistingPayment(existingPayment, sessionId, paymentIntentId);
      
      // Link to campaign if applicable
      if (campaignId && existingPayment.id) {
        await linkPaymentToCampaign(existingPayment.id, campaignId);
      }
      
      console.log(`Successfully updated payment ${existingPayment.id} with Stripe session information`);
      await recordPaymentLog(existingPayment.id, 'checkout_updated', 'Payment record updated with checkout session info', {
        payment_id: existingPayment.id,
        session_id: sessionId
      });
      
      return { success: true, message: "Payment updated successfully" };
    } else {
      // No existing payment found, create a new one with available information
      console.log("No existing payment found, creating new record from webhook data");
      
      const newPayment = await createNewPayment(session, sessionId, paymentIntentId, fingerprintId, userId, campaignId);
      
      // Create campaign_payment record if applicable
      if (campaignId && newPayment?.id) {
        await linkPaymentToCampaign(newPayment.id, campaignId);
      }
      
      return { success: true, message: "New payment record created from webhook data" };
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    await recordPaymentLog(paymentId, 'checkout_error', 'Error handling checkout session', {
      error: error.message,
      session_id: sessionId,
      payment_intent_id: paymentIntentId
    });
    return { success: false, error: error.message };
  }
};
