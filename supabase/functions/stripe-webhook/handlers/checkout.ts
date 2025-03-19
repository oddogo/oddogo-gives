
import { supabaseClient } from '../utils/db.ts';

export const handleCheckoutSessionCompleted = async (session: any) => {
  console.log('Processing checkout.session.completed event');
  console.log('Session metadata:', JSON.stringify(session.metadata || {}, null, 2));
  
  // Extract payment ID from metadata
  const paymentId = session.metadata?.payment_id;
  if (!paymentId) {
    console.error('No payment_id found in session metadata. Full session:', JSON.stringify(session, null, 2));
    return;
  }

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
  } catch (error) {
    console.error('Exception in handleCheckoutSessionCompleted:', error);
  }
};
