
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { PaymentData } from './types.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export const createPaymentRecord = async (paymentData: PaymentData) => {
  const { data: payment, error: paymentError } = await supabaseClient
    .from('stripe_payments')
    .insert([paymentData])
    .select()
    .single();

  if (paymentError) {
    console.error('Error creating payment record:', paymentError);
    throw new Error('Failed to create payment record');
  }

  return payment;
};

export const updatePaymentWithStripeId = async (paymentId: string, stripePaymentIntentId: string) => {
  const { error: updateError } = await supabaseClient
    .from('stripe_payments')
    .update({ stripe_payment_intent_id: stripePaymentIntentId })
    .eq('id', paymentId);

  if (updateError) {
    console.error('Error updating payment record with Stripe ID:', updateError);
    throw new Error('Failed to update payment record with Stripe session details');
  }
};

export const getFingerprintId = async (recipientId: string) => {
  const { data: fingerprint, error: fingerprintError } = await supabaseClient
    .from('fingerprints_users')
    .select('fingerprint_id')
    .eq('user_id', recipientId)
    .maybeSingle();

  if (fingerprintError) {
    console.error('Error fetching fingerprint:', fingerprintError);
    throw new Error('Failed to fetch recipient fingerprint');
  }

  if (!fingerprint?.fingerprint_id) {
    console.error('No fingerprint found for recipient:', recipientId);
    throw new Error('Recipient not found');
  }

  return fingerprint.fingerprint_id;
};

export const getUserId = async (authHeader: string | null) => {
  if (!authHeader) return null;
  
  const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
  return user?.id || null;
};
