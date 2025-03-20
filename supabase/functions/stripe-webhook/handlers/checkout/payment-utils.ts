
import { supabaseClient, recordPaymentLog } from "../../utils/db.ts";

/**
 * Finds a payment record using either session ID or internal payment ID
 */
export async function findPaymentRecord(sessionId: string, paymentId: string) {
  console.log(`Attempting to find payment record by session ID: ${sessionId}`);
  
  // Try to find an existing payment record using session ID
  let { data: existingPayment, error: fetchError } = await supabaseClient
    .from('stripe_payments')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  
  console.log(`Session ID search result:`, { found: !!existingPayment, error: fetchError?.message });
  
  // If payment not found by session ID, try finding it by our payment_id
  if (fetchError || !existingPayment) {
    if (paymentId && paymentId !== 'none') {
      console.log(`Trying to find payment by internal ID: ${paymentId}`);
      
      const { data: paymentByInternalId, error: internalIdFetchError } = await supabaseClient
        .from('stripe_payments')
        .select('*')
        .eq('id', paymentId)
        .maybeSingle();
        
      if (!internalIdFetchError && paymentByInternalId) {
        existingPayment = paymentByInternalId;
        console.log(`Found payment by internal ID: ${paymentId}`);
      } else {
        console.error(`Could not find payment with ID: ${paymentId}`, internalIdFetchError);
        await recordPaymentLog(paymentId, 'payment_not_found', `Payment record not found for ID: ${paymentId}`, {
          session_id: sessionId,
          error: internalIdFetchError?.message || 'No error details'
        });
      }
    }
  }
  
  return existingPayment;
}

/**
 * Updates an existing payment record with checkout session data
 */
export async function updateExistingPayment(existingPayment: any, sessionId: string, paymentIntentId: string) {
  console.log(`Updating existing payment record ${existingPayment.id} with checkout session information`);
  
  const { error: updateError } = await supabaseClient
    .from('stripe_payments')
    .update({
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', existingPayment.id);
    
  if (updateError) {
    console.error('Error updating payment with session info:', updateError);
    await recordPaymentLog(existingPayment.id, 'update_error', 'Failed to update payment with session info', {
      error: updateError.message,
      payment_id: existingPayment.id
    });
    throw updateError;
  }
  
  return { success: true };
}

/**
 * Creates a new payment record from checkout session data
 */
export async function createNewPayment(session: any, sessionId: string, paymentIntentId: string, fingerprintId: string, userId: string, campaignId: string) {
  // Ensure we're storing the correct amount in POUNDS (convert from pence)
  const amount = session.amount_total ? session.amount_total / 100 : 0;
  console.log(`Creating payment with amount £${amount} (from original amount_total: ${session.amount_total} pence)`);
  
  const { data: newPayment, error: insertError } = await supabaseClient
    .from('stripe_payments')
    .insert({
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      status: 'processing',
      amount: amount, // Correctly handled amount in pounds
      stripe_payment_email: session.customer_details?.email || '',
      message: 'Created from webhook data',
      fingerprint_id: fingerprintId,
      user_id: userId,
      campaign_id: campaignId,
      currency: 'gbp'
    })
    .select()
    .single();
    
  if (insertError) {
    console.error('Error creating new payment from webhook:', insertError);
    await recordPaymentLog('new-payment', 'create_error', 'Failed to create new payment from webhook', {
      error: insertError.message,
      session_id: sessionId
    });
    throw insertError;
  }
  
  console.log(`Created new payment record ${newPayment.id} from webhook data`);
  await recordPaymentLog(newPayment.id, 'payment_created', 'New payment record created from webhook data', {
    payment_id: newPayment.id,
    session_id: sessionId
  });
  
  return newPayment;
}
