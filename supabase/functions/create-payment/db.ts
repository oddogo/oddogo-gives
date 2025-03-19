
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { PaymentData } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export const createPaymentRecord = async (paymentData: PaymentData) => {
  console.log('Creating payment record with data:', JSON.stringify(paymentData));
  
  try {
    const { data, error } = await supabase
      .from('stripe_payments')
      .insert({
        amount: paymentData.amount,
        currency: paymentData.currency,
        fingerprint_id: paymentData.fingerprint_id,
        user_id: paymentData.user_id,
        status: paymentData.status,
        stripe_payment_email: paymentData.stripe_payment_email,
        stripe_payment_method_id: paymentData.stripe_payment_method_id,
        stripe_charge_id: paymentData.stripe_charge_id,
        message: paymentData.message,
        donor_name: paymentData.donor_name || 'Anonymous'
      })
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
    const { error } = await supabase
      .from('stripe_payment_logs')
      .insert({
        payment_id: paymentId,
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
