
import { supabaseClient, logWebhookEvent } from '../utils/db.ts';

export const handleCheckoutSessionCompleted = async (session: any) => {
  console.log('Processing checkout.session.completed event');
  console.log('Session metadata:', JSON.stringify(session.metadata || {}, null, 2));
  
  // Extract payment ID from metadata
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in session metadata. Full session:', JSON.stringify(session, null, 2));
    
    // Add fallback logic to find payment by stripe session id
    const { data: paymentBySessionId, error: sessionError } = await supabaseClient
      .from('stripe_payments')
      .select('id')
      .eq('stripe_payment_intent_id', session.payment_intent)
      .maybeSingle();
      
    if (sessionError) {
      console.error('Error finding payment by session ID:', sessionError);
      
      // Log this webhook failure for monitoring
      await logWebhookEvent(
        'checkout.session.completed.failure',
        session.id,
        null,
        { 
          error: 'Failed to find payment record by payment intent', 
          session_id: session.id,
          payment_intent: session.payment_intent
        },
        !session.livemode
      );
      return;
    }
    
    if (paymentBySessionId) {
      console.log('Found payment by payment intent ID:', paymentBySessionId.id);
      return processCheckoutSession(paymentBySessionId.id, session);
    }
    
    // If still no match, try to find by email
    if (session.customer_email || session.customer_details?.email) {
      const customerEmail = session.customer_email || session.customer_details?.email;
      console.log('Attempting to find payment by email:', customerEmail);
      
      const { data: paymentByEmail, error: emailError } = await supabaseClient
        .from('stripe_payments')
        .select('id')
        .eq('stripe_payment_email', customerEmail)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (emailError) {
        console.error('Error finding payment by email:', emailError);
      } else if (paymentByEmail) {
        console.log('Found payment by email:', paymentByEmail.id);
        return processCheckoutSession(paymentByEmail.id, session);
      }
    }
    
    // If we still can't find the payment, create a new one
    if (session.amount_total && session.payment_intent) {
      console.log('Creating new payment record for orphaned checkout session');
      
      // Try to get customer details
      const customerEmail = session.customer_email || session.customer_details?.email || '';
      const customerName = session.customer_details?.name || 'Anonymous';
      
      const newPaymentData = {
        amount: session.amount_total,
        currency: session.currency.toLowerCase(),
        stripe_payment_intent_id: session.payment_intent,
        stripe_payment_email: customerEmail,
        status: 'processing',
        donor_name: customerName,
        user_id: session.metadata?.recipient_id || null,
        fingerprint_id: session.metadata?.fingerprint_id || null,
        campaign_id: session.metadata?.campaign_id || null,
        message: session.metadata?.message || null
      };
      
      const { data: newPayment, error: createError } = await supabaseClient
        .from('stripe_payments')
        .insert(newPaymentData)
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating new payment record:', createError);
        return;
      }
      
      console.log('Created new payment record:', newPayment.id);
      return processCheckoutSession(newPayment.id, session);
    }
    
    // Log webhook failure
    await logWebhookEvent(
      'checkout.session.completed.unprocessable',
      session.id,
      null,
      { 
        error: 'Could not find or create matching payment record',
        session: session
      },
      !session.livemode
    );
    return;
  }

  return processCheckoutSession(paymentId, session);
};

// Helper function to process checkout session with payment ID
async function processCheckoutSession(paymentId: string, session: any) {
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
      
      // First check if this payment is already linked to a campaign
      const { data: existingLink, error: checkError } = await supabaseClient
        .from('campaign_payments')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing campaign link:', checkError);
      } else if (!existingLink) {
        // Only create the link if it doesn't exist yet
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
      } else {
        console.log('Payment already linked to campaign, skipping');
      }
    }
    
    // Log successful processing
    await logWebhookEvent(
      'checkout.session.completed.processed',
      session.id,
      paymentId,
      { payment_intent_id: paymentIntentId },
      !session.livemode
    );
  } catch (error) {
    console.error('Exception in processCheckoutSession:', error);
    
    // Log exception
    await logWebhookEvent(
      'checkout.session.completed.error',
      session.id,
      paymentId,
      { error: String(error) },
      !session.livemode
    );
  }
}
