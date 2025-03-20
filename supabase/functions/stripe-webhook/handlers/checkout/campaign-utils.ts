
import { supabaseClient, recordPaymentLog } from "../../utils/db.ts";

/**
 * Links a payment to a campaign by creating a campaign_payments record
 */
export async function linkPaymentToCampaign(paymentId: string, campaignId: string) {
  if (!campaignId || !paymentId) {
    console.log('Missing campaign ID or payment ID, skipping campaign payment linking');
    return { success: false };
  }
  
  console.log(`Linking payment ${paymentId} to campaign ${campaignId}`);
  
  // Check if a record already exists
  const { data: existingCampaignPayment, error: campaignFetchError } = await supabaseClient
    .from('campaign_payments')
    .select('*')
    .eq('payment_id', paymentId)
    .eq('campaign_id', campaignId)
    .maybeSingle();
    
  if (campaignFetchError || !existingCampaignPayment) {
    // Create a new campaign payment record
    const { error: campaignInsertError } = await supabaseClient
      .from('campaign_payments')
      .insert({
        payment_id: paymentId,
        campaign_id: campaignId,
        created_at: new Date().toISOString()
      });
      
    if (campaignInsertError) {
      console.error('Error creating campaign_payment:', campaignInsertError);
      await recordPaymentLog(paymentId, 'campaign_payment_error', 'Failed to create campaign payment record', {
        error: campaignInsertError.message,
        campaign_id: campaignId
      });
      return { success: false, error: campaignInsertError };
    } else {
      console.log(`Created campaign_payment link for payment ${paymentId} and campaign ${campaignId}`);
      await recordPaymentLog(paymentId, 'campaign_payment_created', 'Campaign payment record created', {
        campaign_id: campaignId
      });
      return { success: true };
    }
  } else {
    console.log(`Campaign payment record already exists for payment ${paymentId} and campaign ${campaignId}`);
    return { success: true };
  }
}
