
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { PaymentRequest } from "./types.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export async function createPaymentRecord(paymentRequest: PaymentRequest) {
  try {
    console.log('Creating payment record with data:', JSON.stringify(paymentRequest));
    
    // Get fingerprint_id for the recipient
    let fingerprintId: string | null = null;
    
    if (paymentRequest.recipientId) {
      const { data: fingerprintUser, error: fingerprintError } = await supabaseClient
        .from('fingerprints_users')
        .select('fingerprint_id')
        .eq('user_id', paymentRequest.recipientId)
        .is('deleted_at', null)
        .single();
      
      if (fingerprintError) {
        console.warn('Error fetching fingerprint:', fingerprintError);
      } else if (fingerprintUser) {
        fingerprintId = fingerprintUser.fingerprint_id;
        console.log('Found fingerprint ID:', fingerprintId);
      }
    }
    
    // Create a new payment record
    const { data, error } = await supabaseClient
      .from('stripe_payments')
      .insert({
        amount: paymentRequest.amount,
        stripe_payment_email: paymentRequest.email,
        message: paymentRequest.message || null,
        status: 'pending',
        campaign_id: paymentRequest.campaignId || null,
        campaign_title: paymentRequest.campaignTitle || null,
        campaign_slug: paymentRequest.campaignSlug || null,
        donor_name: paymentRequest.name || null,
        user_id: paymentRequest.recipientId || null,
        fingerprint_id: fingerprintId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating payment record:', error);
      return { paymentId: null, error: error.message };
    }
    
    console.log('Payment record created successfully:', data);
    
    // Also create a campaign_payment record if there's a campaign
    if (data && paymentRequest.campaignId) {
      console.log('Creating campaign payment record for campaign:', paymentRequest.campaignId);
      const { error: campaignPaymentError } = await supabaseClient
        .from('campaign_payments')
        .insert({
          payment_id: data.id,
          campaign_id: paymentRequest.campaignId
        });
      
      if (campaignPaymentError) {
        console.error('Error creating campaign payment record:', campaignPaymentError);
        // We don't fail the whole operation for this
      } else {
        console.log('Campaign payment record created successfully');
      }
    }
    
    return { paymentId: data.id, error: null };
  } catch (error) {
    console.error('Exception creating payment record:', error);
    return { paymentId: null, error: error.message };
  }
}
