
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";
import { supabaseClient, recordPaymentLog } from "../utils/db.ts";

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
    
    // If we found a payment, update it with the Stripe information
    if (existingPayment) {
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
      
      // Create or update the campaign_payments record if there's a campaign ID
      if (campaignId && existingPayment.id) {
        console.log(`Linking payment ${existingPayment.id} to campaign ${campaignId}`);
        
        // Check if a record already exists
        const { data: existingCampaignPayment, error: campaignFetchError } = await supabaseClient
          .from('campaign_payments')
          .select('*')
          .eq('payment_id', existingPayment.id)
          .eq('campaign_id', campaignId)
          .maybeSingle();
          
        if (campaignFetchError || !existingCampaignPayment) {
          // Create a new campaign payment record
          const { error: campaignInsertError } = await supabaseClient
            .from('campaign_payments')
            .insert({
              payment_id: existingPayment.id,
              campaign_id: campaignId,
              created_at: new Date().toISOString()
            });
            
          if (campaignInsertError) {
            console.error('Error creating campaign_payment:', campaignInsertError);
            await recordPaymentLog(existingPayment.id, 'campaign_payment_error', 'Failed to create campaign payment record', {
              error: campaignInsertError.message,
              campaign_id: campaignId
            });
          } else {
            console.log(`Created campaign_payment link for payment ${existingPayment.id} and campaign ${campaignId}`);
            await recordPaymentLog(existingPayment.id, 'campaign_payment_created', 'Campaign payment record created', {
              campaign_id: campaignId
            });
          }
        } else {
          console.log(`Campaign payment record already exists for payment ${existingPayment.id} and campaign ${campaignId}`);
        }
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
      
      // Create campaign_payment record if applicable
      if (campaignId && newPayment?.id) {
        const { error: campaignInsertError } = await supabaseClient
          .from('campaign_payments')
          .insert({
            payment_id: newPayment.id,
            campaign_id: campaignId,
            created_at: new Date().toISOString()
          });
          
        if (campaignInsertError) {
          console.error('Error creating campaign_payment from webhook:', campaignInsertError);
          await recordPaymentLog(newPayment.id, 'campaign_payment_error', 'Failed to create campaign payment record', {
            error: campaignInsertError.message,
            campaign_id: campaignId
          });
        } else {
          console.log(`Created campaign_payment link for new payment ${newPayment.id} and campaign ${campaignId}`);
          await recordPaymentLog(newPayment.id, 'campaign_payment_created', 'Campaign payment record created', {
            campaign_id: campaignId
          });
        }
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
