
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { PaymentData } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const createPaymentRecord = async (paymentData: PaymentData) => {
  console.log('Creating payment record with data:', JSON.stringify(paymentData));
  
  try {
    // Prepare the payment data, ensuring fingerprint_id is only included if it's a valid UUID
    const paymentRecord = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      user_id: paymentData.user_id,
      status: paymentData.status,
      stripe_payment_email: paymentData.stripe_payment_email,
      stripe_payment_method_id: paymentData.stripe_payment_method_id,
      stripe_charge_id: paymentData.stripe_charge_id,
      message: paymentData.message,
      donor_name: paymentData.donor_name || 'Anonymous'
    };

    // Only add fingerprint_id if it exists and is not null/undefined
    if (paymentData.fingerprint_id && isValidUUID(paymentData.fingerprint_id)) {
      // @ts-ignore - TypeScript won't allow adding properties to the object after creation
      paymentRecord.fingerprint_id = paymentData.fingerprint_id;
    }

    // Add campaignId if it exists
    if (paymentData.campaignId) {
      // @ts-ignore
      paymentRecord.campaign_id = paymentData.campaignId;
    }

    const { data, error } = await supabase
      .from('stripe_payments')
      .insert(paymentRecord)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      throw new Error(`Failed to create payment record: ${error.message}`);
    }

    console.log('Payment record created successfully with ID:', data.id);
    return data;
  } catch (error) {
    console.error('Exception creating payment record:', error);
    throw new Error(`Failed to create payment record: ${error.message}`);
  }
};

export const recordPaymentLog = async (paymentId: string, status: string, message: string, metadata?: any) => {
  console.log(`Recording payment log: ${status} - ${message} for payment ${paymentId}`);
  
  try {
    // Make sure we're not trying to use 'none' as a UUID
    const validPaymentId = paymentId && paymentId !== 'none' ? paymentId : null;
    
    const { error } = await supabase
      .from('stripe_payment_logs')
      .insert({
        payment_id: validPaymentId,
        status,
        message,
        metadata
      });

    if (error) {
      console.error('Error recording payment log:', error);
    }
  } catch (error) {
    console.error('Exception recording payment log:', error);
  }
};

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
