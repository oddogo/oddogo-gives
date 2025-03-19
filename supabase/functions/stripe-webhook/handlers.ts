import { supabaseClient, updatePaymentWithSession, getPayment, updatePaymentStatus, logPaymentActivity, findPaymentByIntentId, createCampaignPayment } from './db.ts';
import { StripeSession, PaymentIntent } from './types.ts';

export const handleCheckoutSessionCompleted = async (session: StripeSession) => {
  const paymentId = session.metadata?.payment_id;
  const campaignId = session.metadata?.campaign_id;
  
  console.log('Processing checkout session completed:', paymentId);
  console.log('Session details:', {
    id: session.id,
    email: session.customer_email,
    customer: session.customer,
    payment_intent: session.payment_intent,
    payment_method: session.payment_method,
    campaign_id: campaignId
  });
  
  if (!paymentId) {
    console.log('No payment ID in session metadata, skipping database update');
    return;
  }
  
  // Log campaign ID in the payment logs
  await logPaymentActivity(
    paymentId,
    {
      session_id: session.id,
      campaign_id: campaignId || null
    },
    'session_completed',
    `Checkout session completed. Campaign ID: ${campaignId || 'None'}`
  );
  
  const updateData = { 
    stripe_payment_intent_id: session.payment_intent,
    stripe_payment_method_id: session.payment_method,
    stripe_payment_email: session.customer_email,
    stripe_customer_id: session.customer,
    updated_at: new Date().toISOString()
  };
  
  // Only set campaign_id if it exists and isn't an empty string
  if (campaignId && campaignId.trim() !== '') {
    updateData.campaign_id = campaignId;
    console.log(`Setting campaign_id to ${campaignId} from session metadata`);
  }
  
  await updatePaymentWithSession(paymentId, updateData);
};

export const handlePaymentIntentSucceeded = async (paymentIntent: PaymentIntent) => {
  const paymentId = paymentIntent.metadata?.payment_id;
  const campaignId = paymentIntent.metadata?.campaign_id;
  
  console.log('Processing successful payment intent:', paymentIntent.id);
  console.log('Payment intent metadata:', paymentIntent.metadata || {});
  console.log('Campaign ID from metadata:', campaignId);
  
  // Try to find a payment record by payment intent ID if no metadata payment_id
  if (!paymentId) {
    console.log('No payment ID in metadata, trying to find payment by intent ID');
    
    const paymentByIntent = await findPaymentByIntentId(paymentIntent.id);
        
    if (paymentByIntent) {
      console.log(`Found payment record ${paymentByIntent.id} by intent ID`);
      console.log(`Campaign ID from database: ${paymentByIntent.campaign_id || 'None'}`);
      
      // Update the payment record, preserving campaign_id
      const updateData = { 
        status: 'completed',
        stripe_payment_method_id: paymentIntent.payment_method,
        stripe_charge_id: paymentIntent.latest_charge,
        updated_at: new Date().toISOString()
      };
      
      // If the payment intent has a campaign_id, use it
      if (campaignId && campaignId.trim() !== '') {
        console.log(`Using campaign_id ${campaignId} from payment intent metadata`);
        updateData.campaign_id = campaignId;
      }
      
      const updatedPayment = await updatePaymentStatus(paymentByIntent.id, updateData);
      
      console.log(`Successfully updated payment ${paymentByIntent.id} to completed`);
      console.log(`Final campaign_id: ${updatedPayment.campaign_id || 'None'}`);
      
      // Create campaign payment record if there's a campaign_id
      if (updatedPayment.campaign_id) {
        console.log(`Creating campaign payment link for campaign ${updatedPayment.campaign_id}`);
        await createCampaignPayment(updatedPayment.campaign_id, paymentByIntent.id);
      }
      
      // Log the payment status update with campaign info
      await logPaymentActivity(
        paymentByIntent.id, 
        {
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentIntent.payment_method,
          charge_id: paymentIntent.latest_charge,
          campaign_id: updatedPayment.campaign_id || null
        },
        'completed',
        `Payment completed successfully (found by intent ID). Campaign ID: ${updatedPayment.campaign_id || 'None'}`
      );
    } else {
      console.log('No matching payment record found for intent ID:', paymentIntent.id);
      // This might be a webhook from a different app or test event
    }
  } else {
    // We have a payment ID in metadata, proceed with regular update
    
    // First, get the current payment record to preserve existing campaign_id if needed
    const currentPayment = await getPayment(paymentId);
    console.log('Current payment from database:', currentPayment);
    
    // Create update data with all the fields
    const updateData = { 
      status: 'completed',
      stripe_payment_intent_id: paymentIntent.id,
      stripe_payment_method_id: paymentIntent.payment_method,
      stripe_charge_id: paymentIntent.latest_charge,
      updated_at: new Date().toISOString()
    };
    
    // Determine which campaign_id to use, prioritizing:
    // 1. The campaign_id from Stripe metadata (if present)
    // 2. The existing campaign_id in the database (if present)
    if (campaignId && campaignId.trim() !== '') {
      console.log(`Using campaign_id ${campaignId} from payment intent metadata`);
      updateData.campaign_id = campaignId;
    } else if (currentPayment?.campaign_id) {
      console.log(`Preserving existing campaign_id ${currentPayment.campaign_id} from database`);
      updateData.campaign_id = currentPayment.campaign_id;
    } else {
      console.log('No campaign_id in metadata or database');
    }

    const updatedPayment = await updatePaymentStatus(paymentId, updateData);
    console.log('Updated payment:', updatedPayment);
    console.log(`Final campaign_id: ${updatedPayment.campaign_id || 'None'}`);

    // Create campaign payment record if there's a campaign_id
    if (updatedPayment.campaign_id) {
      console.log(`Creating campaign payment link for campaign ${updatedPayment.campaign_id}`);
      await createCampaignPayment(updatedPayment.campaign_id, updatedPayment.id);
    }

    // Log the payment activity with campaign info
    await logPaymentActivity(
      paymentId,
      {
        payment_intent_id: paymentIntent.id,
        payment_method_id: paymentIntent.payment_method,
        charge_id: paymentIntent.latest_charge,
        campaign_id: updatedPayment.campaign_id || null
      },
      'completed',
      `Payment completed successfully. Campaign ID: ${updatedPayment.campaign_id || 'None'}`
    );
  }
};

export const handlePaymentIntentFailed = async (paymentIntent: PaymentIntent) => {
  const paymentId = paymentIntent.metadata?.payment_id;
  const campaignId = paymentIntent.metadata?.campaign_id;
  
  console.log('Processing failed payment:', paymentId || paymentIntent.id);
  console.log('Campaign ID from metadata:', campaignId);
  
  // Similar to the succeeded case, try to find by intent ID if no metadata
  if (!paymentId) {
    const paymentByIntent = await findPaymentByIntentId(paymentIntent.id);
        
    if (paymentByIntent) {
      await updatePaymentStatus(paymentByIntent.id, { 
        status: 'failed',
        updated_at: new Date().toISOString()
      });
        
      console.log(`Updated payment ${paymentByIntent.id} to failed status`);
      
      await logPaymentActivity(
        paymentByIntent.id,
        {
          payment_intent_id: paymentIntent.id,
          campaign_id: paymentByIntent.campaign_id || campaignId || null
        },
        'failed',
        paymentIntent.last_payment_error?.message || 'Payment failed'
      );
    } else {
      console.log('No matching payment record found for failed intent:', paymentIntent.id);
    }
  } else if (paymentId) {
    // First, get the current payment record to preserve existing campaign_id if needed
    const currentPayment = await getPayment(paymentId);
    
    const updateData = {
      status: 'failed',
      updated_at: new Date().toISOString()
    };
    
    // Preserve campaign_id if it exists
    if (campaignId && campaignId.trim() !== '') {
      updateData.campaign_id = campaignId;
    } else if (currentPayment?.campaign_id) {
      // Keep existing campaign_id
    }
    
    await updatePaymentStatus(paymentId, updateData);

    console.log('Successfully updated payment status to failed');

    await logPaymentActivity(
      paymentId,
      {
        payment_intent_id: paymentIntent.id,
        campaign_id: currentPayment?.campaign_id || campaignId || null
      },
      'failed',
      paymentIntent.last_payment_error?.message || 'Payment failed'
    );
  }
};
