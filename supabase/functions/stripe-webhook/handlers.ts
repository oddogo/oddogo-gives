import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

/**
 * Logs a webhook event to the database
 */
export const logWebhookEvent = async (
  eventType: string, 
  eventId: string, 
  paymentId: string | null | undefined,
  rawEvent: any,
  isTest: boolean,
  status = 'received'
) => {
  try {
    const { error } = await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_type: eventType,
        stripe_event_id: eventId,
        payment_id: paymentId,
        status,
        raw_event: rawEvent,
        is_test: isTest
      });

    if (error) {
      console.error('Error storing webhook event:', error);
    } else {
      console.log('Successfully logged webhook event:', eventId);
    }
  } catch (err) {
    console.error('Exception logging webhook event:', err);
  }
};

/**
 * Marks a webhook event as processed
 */
export const markWebhookProcessed = async (eventId: string) => {
  try {
    const { error } = await supabaseClient
      .from('stripe_webhook_events')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', eventId);

    if (error) {
      console.error('Error marking webhook as processed:', error);
    } else {
      console.log('Successfully marked webhook as processed');
    }
  } catch (err) {
    console.error('Exception marking webhook as processed:', err);
  }
};

/**
 * Logs payment status changes
 */
export const logPaymentStatusChange = async (
  paymentId: string,
  status: string,
  message: string,
  metadata: any
) => {
  try {
    const { error } = await supabaseClient
      .from('stripe_payment_logs')
      .insert({
        payment_id: paymentId,
        metadata,
        status,
        message
      });

    if (error) {
      console.error('Error logging payment status change:', error);
    } else {
      console.log(`Successfully logged payment ${status} for ${paymentId}`);
    }
  } catch (err) {
    console.error('Exception logging payment status:', err);
  }
};

/**
 * Creates or verifies a campaign payment relationship
 */
export const createOrVerifyCampaignPayment = async (campaignId: string, paymentId: string) => {
  try {
    console.log(`Creating/verifying campaign payment relation for campaign ${campaignId} and payment ${paymentId}`);
    
    // First check if the campaign exists
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .maybeSingle();
      
    if (campaignError || !campaign) {
      console.error('Campaign not found or error:', campaignError);
      return;
    }
    
    // Next check if the payment exists
    const { data: payment, error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .select('id, status')
      .eq('id', paymentId)
      .maybeSingle();
      
    if (paymentError || !payment) {
      console.error('Payment not found or error:', paymentError);
      return;
    }
    
    // Only create campaign payment relation if payment status is completed
    if (payment.status !== 'completed') {
      console.log(`Payment ${paymentId} status is ${payment.status}, not creating campaign payment relation yet`);
      return;
    }
    
    // First check if the relation already exists
    const { data: existingRelation, error: relationError } = await supabaseClient
      .from('campaign_payments')
      .select('id')
      .match({
        campaign_id: campaignId,
        payment_id: paymentId
      })
      .maybeSingle();
    
    if (relationError) {
      console.error('Error checking existing campaign payment relation:', relationError);
      return;
    }
    
    if (existingRelation) {
      console.log('Campaign payment relation already exists:', existingRelation);
      return;
    }
    
    // Create the relation if it doesn't exist
    const { data: newRelation, error: createError } = await supabaseClient
      .from('campaign_payments')
      .insert({
        campaign_id: campaignId,
        payment_id: paymentId
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating campaign payment record:', createError);
      throw new Error(`Failed to create campaign payment: ${createError.message}`);
    } else {
      console.log('Successfully created campaign payment record:', newRelation);
    }
  } catch (err) {
    console.error('Exception handling campaign payment:', err);
    // Log the error but don't throw to prevent the webhook from failing
  }
};

/**
 * Finds a payment by Stripe payment intent ID
 */
export const findPaymentByIntentId = async (paymentIntentId: string) => {
  try {
    const { data: payment, error } = await supabaseClient
      .from('stripe_payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error looking up payment by intent ID:', error);
      return null;
    }
    
    return payment;
  } catch (err) {
    console.error('Exception finding payment by intent ID:', err);
    return null;
  }
};

/**
 * Gets a payment by ID
 */
export const getPaymentById = async (paymentId: string) => {
  try {
    const { data: payment, error } = await supabaseClient
      .from('stripe_payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle();
      
    if (error) {
      console.error('Error getting payment by ID:', error);
      return null;
    }
    
    return payment;
  } catch (err) {
    console.error('Exception getting payment by ID:', err);
    return null;
  }
};

/**
 * Updates a payment record
 */
export const updatePayment = async (paymentId: string, updateData: any) => {
  try {
    const { data: updatedPayment, error } = await supabaseClient
      .from('stripe_payments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating payment ${paymentId}:`, error);
      return null;
    }
    
    console.log(`Successfully updated payment ${paymentId}:`, updatedPayment);
    return updatedPayment;
  } catch (err) {
    console.error(`Exception updating payment ${paymentId}:`, err);
    return null;
  }
};

/**
 * Handles a checkout session completed event
 */
export const handleCheckoutSessionCompleted = async (session: any) => {
  const paymentId = session.metadata?.payment_id;
  const campaignId = session.metadata?.campaign_id;
  const fingerprintId = session.metadata?.fingerprint_id;
  const message = session.metadata?.message;
  
  console.log('Processing checkout session completed:', paymentId);
  console.log('Session details:', {
    id: session.id,
    email: session.customer_email,
    customer: session.customer,
    payment_intent: session.payment_intent,
    payment_method: session.payment_method,
    campaignId: campaignId || 'none',
    fingerprintId: fingerprintId || 'none',
    message: message || 'none'
  });
  
  if (!paymentId) {
    console.log('No payment ID in session metadata, skipping database update');
    return;
  }
  
  // Get the existing payment record first to preserve any existing data
  const existingPayment = await getPaymentById(paymentId);
  
  if (!existingPayment) {
    console.warn(`Payment with ID ${paymentId} not found in database`);
  }
  
  // Prepare the update fields, using existing data as fallback
  const updateFields = {
    stripe_payment_intent_id: session.payment_intent,
    stripe_payment_method_id: session.payment_method,
    stripe_payment_email: session.customer_email || existingPayment?.stripe_payment_email,
    stripe_customer_id: session.customer,
    message: message || existingPayment?.message || '',
    updated_at: new Date().toISOString()
  };
  
  // Ensure we don't lose fingerprint_id
  if (fingerprintId) {
    updateFields['fingerprint_id'] = fingerprintId;
  } else if (existingPayment?.fingerprint_id) {
    // Keep the existing fingerprint_id if available
    console.log(`Using existing fingerprint_id ${existingPayment.fingerprint_id}`);
  } else {
    console.warn('No fingerprint_id found in session metadata or existing payment');
  }
  
  const updatedPayment = await updatePayment(paymentId, updateFields);

  if (!updatedPayment) {
    console.error('Failed to update payment record for checkout session');
    return;
  }

  console.log('Successfully updated payment with Stripe session details:', updatedPayment);

  // Handle campaign payment if campaign_id is present
  if (campaignId) {
    await createOrVerifyCampaignPayment(campaignId, paymentId);
  }
};

/**
 * Handles a payment intent succeeded event
 */
export const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  const paymentId = paymentIntent.metadata?.payment_id;
  const campaignId = paymentIntent.metadata?.campaign_id;
  const fingerprintId = paymentIntent.metadata?.fingerprint_id;
  const message = paymentIntent.metadata?.message;
  
  console.log('Processing successful payment intent:', paymentIntent.id);
  console.log('Payment details:', {
    payment_intent_id: paymentIntent.id,
    payment_method_id: paymentIntent.payment_method,
    charge_id: paymentIntent.latest_charge,
    metadata: paymentIntent.metadata || {},
    fingerprintId: fingerprintId || 'none',
    message: message || 'none'
  });
  
  // If no paymentId in metadata, try to find by payment intent ID
  if (!paymentId) {
    console.log('No payment ID in metadata, trying to find by intent ID');
    
    const paymentByIntent = await findPaymentByIntentId(paymentIntent.id);
      
    if (paymentByIntent) {
      console.log(`Found payment record ${paymentByIntent.id} by intent ID`);
      
      // Prepare update data
      const updateData = { 
        status: 'completed',
        stripe_payment_method_id: paymentIntent.payment_method || paymentByIntent.stripe_payment_method_id,
        stripe_charge_id: paymentIntent.latest_charge,
        message: message || paymentByIntent.message || '',
        updated_at: new Date().toISOString()
      };
      
      // Ensure we don't lose fingerprint_id
      if (fingerprintId) {
        updateData['fingerprint_id'] = fingerprintId;
      } else if (paymentByIntent.fingerprint_id) {
        // Keep existing
        console.log(`Keeping existing fingerprint_id ${paymentByIntent.fingerprint_id}`);
      } else {
        console.warn('No fingerprint_id found in metadata or existing payment');
      }
      
      // Update the payment record
      const updatedPayment = await updatePayment(paymentByIntent.id, updateData);

      if (!updatedPayment) {
        console.error('Failed to update payment by intent ID');
        return;
      }
      
      console.log(`Successfully updated payment ${paymentByIntent.id} to completed`);
      
      // Handle campaign ID if present
      if (campaignId) {
        await createOrVerifyCampaignPayment(campaignId, paymentByIntent.id);
      }
      
      // Log the payment status update
      await logPaymentStatusChange(
        paymentByIntent.id,
        'completed',
        'Payment completed successfully (found by intent ID)',
        {
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentIntent.payment_method,
          charge_id: paymentIntent.latest_charge,
          fingerprint_id: fingerprintId || paymentByIntent.fingerprint_id,
          message: message || paymentByIntent.message
        }
      );
      
      return;
    } else {
      console.log('No matching payment record found for intent ID:', paymentIntent.id);
    }
  } else {
    // Get the existing payment to preserve data
    const existingPayment = await getPaymentById(paymentId);
    
    if (!existingPayment) {
      console.warn(`Payment with ID ${paymentId} not found in database`);
    }
    
    // Prepare update data with fallbacks to existing data
    const updateData = { 
      status: 'completed',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_payment_method_id: paymentIntent.payment_method || existingPayment?.stripe_payment_method_id,
      stripe_charge_id: paymentIntent.latest_charge,
      message: message || existingPayment?.message || '',
      updated_at: new Date().toISOString()
    };
    
    // Ensure we don't lose fingerprint_id
    if (fingerprintId) {
      updateData['fingerprint_id'] = fingerprintId;
    } else if (existingPayment?.fingerprint_id) {
      console.log(`Keeping existing fingerprint_id ${existingPayment.fingerprint_id}`);
    } else {
      console.warn('No fingerprint_id found in metadata or existing payment');
    }
    
    // Update the payment record
    const updatedPayment = await updatePayment(paymentId, updateData);

    if (!updatedPayment) {
      console.error('Failed to update payment status');
      return;
    }

    console.log('Successfully updated payment status to completed:', updatedPayment);

    // If a campaign ID is in metadata, handle it
    if (campaignId) {
      await createOrVerifyCampaignPayment(campaignId, paymentId);
    }

    // Log the payment status update
    await logPaymentStatusChange(
      paymentId,
      'completed',
      'Payment completed successfully',
      {
        payment_intent_id: paymentIntent.id,
        payment_method_id: paymentIntent.payment_method,
        charge_id: paymentIntent.latest_charge,
        campaign_id: campaignId || null,
        fingerprint_id: fingerprintId || existingPayment?.fingerprint_id,
        message: message || existingPayment?.message
      }
    );
  }
};

/**
 * Handles a payment intent failed event
 */
export const handlePaymentIntentFailed = async (paymentIntent: any) => {
  const paymentId = paymentIntent.metadata?.payment_id;
  const fingerprintId = paymentIntent.metadata?.fingerprint_id;
  const message = paymentIntent.metadata?.message;
  
  console.log('Processing failed payment:', paymentId || paymentIntent.id);
  
  // Similar to the succeeded case, try to find by intent ID if no metadata
  if (!paymentId) {
    const paymentByIntent = await findPaymentByIntentId(paymentIntent.id);
      
    if (paymentByIntent) {
      const updateData = { 
        status: 'failed',
        message: message || paymentByIntent.message || '',
        updated_at: new Date().toISOString()
      };
      
      // Ensure we don't lose fingerprint_id
      if (fingerprintId) {
        updateData['fingerprint_id'] = fingerprintId;
      }
      
      await updatePayment(paymentByIntent.id, updateData);
          
      console.log(`Updated payment ${paymentByIntent.id} to failed status`);
      
      await logPaymentStatusChange(
        paymentByIntent.id,
        'failed',
        paymentIntent.last_payment_error?.message || 'Payment failed',
        {
          ...paymentIntent,
          fingerprint_id: fingerprintId || paymentByIntent.fingerprint_id,
          message: message || paymentByIntent.message
        }
      );
    } else {
      console.log('No matching payment record found for failed intent:', paymentIntent.id);
    }
  } else if (paymentId) {
    // Get existing payment to preserve data
    const existingPayment = await getPaymentById(paymentId);
    
    // Prepare update data
    const updateData = { 
      status: 'failed',
      message: message || existingPayment?.message || '',
      updated_at: new Date().toISOString()
    };
    
    // Preserve fingerprint_id
    if (fingerprintId) {
      updateData['fingerprint_id'] = fingerprintId;
    }
    
    await updatePayment(paymentId, updateData);

    console.log('Successfully updated payment status to failed');

    await logPaymentStatusChange(
      paymentId,
      'failed',
      paymentIntent.last_payment_error?.message || 'Payment failed',
      {
        ...paymentIntent,
        fingerprint_id: fingerprintId || existingPayment?.fingerprint_id,
        message: message || existingPayment?.message
      }
    );
  }
};
