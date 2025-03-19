
import { supabaseClient, logWebhookEvent } from '../utils/db.ts';

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
      
    if (findError) {
      console.error('Error finding payment by payment_intent_id:', findError);
      
      // Log this webhook failure
      await logWebhookEvent(
        'payment_intent.succeeded.find_error',
        paymentIntent.id,
        null,
        { error: findError.message },
        !paymentIntent.livemode
      );
      return;
    }
    
    if (!paymentByIntentId) {
      console.error('No payment found with payment_intent_id:', paymentIntent.id);
      
      // If we have an email in the payment intent, try to find by email
      if (paymentIntent.receipt_email) {
        console.log('Attempting to find payment by email:', paymentIntent.receipt_email);
        const { data: paymentByEmail, error: emailError } = await supabaseClient
          .from('stripe_payments')
          .select('id')
          .eq('stripe_payment_email', paymentIntent.receipt_email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (emailError) {
          console.error('Error finding payment by email:', emailError);
          return;
        }
        
        if (!paymentByEmail) {
          console.error('No payment found with email:', paymentIntent.receipt_email);
          
          // Log webhook unresolved
          await logWebhookEvent(
            'payment_intent.succeeded.unresolved',
            paymentIntent.id,
            null,
            { 
              error: 'Could not find payment by email',
              email: paymentIntent.receipt_email
            },
            !paymentIntent.livemode
          );
        } else {
          console.log('Found payment by email:', paymentByEmail.id);
          return handlePaymentSuccessById(paymentByEmail.id, paymentIntent);
        }
      }
      
      // As a last resort, create a new payment record if we have enough information
      if (paymentIntent.amount && paymentIntent.currency) {
        console.log('Creating new payment record for orphaned payment intent');
        
        const newPaymentData = {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toLowerCase(),
          stripe_payment_intent_id: paymentIntent.id,
          stripe_payment_email: paymentIntent.receipt_email || '',
          stripe_payment_method_id: paymentIntent.payment_method || null,
          stripe_charge_id: paymentIntent.latest_charge || null,
          status: 'completed',
          user_id: paymentIntent.metadata?.recipient_id || null,
          fingerprint_id: paymentIntent.metadata?.fingerprint_id || null,
          campaign_id: paymentIntent.metadata?.campaign_id || null,
          donor_name: paymentIntent.metadata?.donor_name || 'Anonymous'
        };
        
        const { data: newPayment, error: createError } = await supabaseClient
          .from('stripe_payments')
          .insert(newPaymentData)
          .select('id')
          .single();
          
        if (createError) {
          console.error('Error creating new payment record:', createError);
          
          // Log create payment failure
          await logWebhookEvent(
            'payment_intent.succeeded.create_error',
            paymentIntent.id,
            null,
            { error: createError.message },
            !paymentIntent.livemode
          );
          return;
        }
        
        console.log('Created new payment record:', newPayment.id);
        
        // Log successful recovery
        await logWebhookEvent(
          'payment_intent.succeeded.recovered',
          paymentIntent.id,
          newPayment.id,
          { 
            recovery_method: 'created_new_payment', 
            amount: paymentIntent.amount 
          },
          !paymentIntent.livemode
        );
        return;
      }
      
      // Log unprocessable payment intent
      await logWebhookEvent(
        'payment_intent.succeeded.unprocessable',
        paymentIntent.id,
        null,
        { 
          error: 'Could not find or create matching payment record',
          payment_intent: paymentIntent
        },
        !paymentIntent.livemode
      );
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
      
      // Log payment update failure
      await logWebhookEvent(
        'payment_intent.succeeded.update_error',
        paymentIntent.id,
        paymentId,
        { error: error.message },
        !paymentIntent.livemode
      );
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
    
    // Log successful processing
    await logWebhookEvent(
      'payment_intent.succeeded.processed',
      paymentIntent.id,
      paymentId,
      { charge_id: chargeId },
      !paymentIntent.livemode
    );
  } catch (error) {
    console.error('Exception in handlePaymentSuccessById:', error);
    
    // Log exception
    await logWebhookEvent(
      'payment_intent.succeeded.error',
      paymentIntent.id,
      paymentId,
      { error: String(error) },
      !paymentIntent.livemode
    );
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
      
      // Log unprocessable payment intent
      await logWebhookEvent(
        'payment_intent.failed.unprocessable',
        paymentIntent.id,
        null,
        { 
          error: 'Could not find matching payment record',
          payment_intent: paymentIntent
        },
        !paymentIntent.livemode
      );
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
      
      // Log payment update failure
      await logWebhookEvent(
        'payment_intent.failed.update_error',
        paymentIntent.id,
        paymentId,
        { error: error.message },
        !paymentIntent.livemode
      );
      return;
    }

    console.log('Payment marked as failed successfully:', data);
    
    // Log successful processing
    await logWebhookEvent(
      'payment_intent.failed.processed',
      paymentIntent.id,
      paymentId,
      { failure_message: failureMessage },
      !paymentIntent.livemode
    );
  } catch (error) {
    console.error('Exception in handlePaymentIntentFailed:', error);
    
    // Log exception
    await logWebhookEvent(
      'payment_intent.failed.error',
      paymentIntent.id,
      paymentId,
      { error: String(error) },
      !paymentIntent.livemode
    );
  }
};
