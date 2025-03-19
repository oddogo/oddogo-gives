
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { PaymentData } from './types.ts';

// Initialize the Supabase client with service role key for admin access
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables for Supabase client');
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const createPaymentRecord = async (paymentData: PaymentData) => {
  if (!paymentData.amount) {
    throw new Error('Amount is required for payment record');
  }
  
  // Include campaignId only if it's provided and not empty
  const paymentRecord = {
    amount: paymentData.amount,
    currency: paymentData.currency || 'gbp',
    fingerprint_id: paymentData.fingerprint_id || null,
    user_id: paymentData.user_id || null,
    status: paymentData.status || 'pending',
    stripe_payment_email: paymentData.stripe_payment_email || null,
    stripe_payment_method_id: paymentData.stripe_payment_method_id || null,
    message: paymentData.message || null,
    donor_name: paymentData.donor_name || null
  };
  
  // Only add campaignId if it exists and isn't an empty string
  if (paymentData.campaignId && paymentData.campaignId.trim() !== '') {
    console.log(`Adding campaign_id ${paymentData.campaignId} to payment record`);
    // @ts-ignore - TypeScript doesn't know about our DB schema, this is fine
    paymentRecord.campaign_id = paymentData.campaignId;
  } else {
    console.log('No campaign_id provided for payment record');
  }

  try {
    const { data, error } = await supabaseClient
      .from('stripe_payments')
      .insert(paymentRecord)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      throw new Error(`Failed to create payment record: ${error.message}`);
    }

    if (!data) {
      throw new Error('Payment record was created but no ID was returned');
    }

    console.log(`Payment record created successfully with ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Exception in createPaymentRecord:', error);
    throw error;
  }
};

// Add a function to record payment logs
export const recordPaymentLog = async (
  paymentId: string,
  status: string,
  message: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const { error } = await supabaseClient
      .from('stripe_payment_logs')
      .insert({
        payment_id: paymentId === 'none' ? null : paymentId,
        status,
        message,
        metadata
      });

    if (error) {
      console.error('Error recording payment log:', error);
    }
  } catch (error) {
    console.error('Exception in recordPaymentLog:', error);
  }
};
