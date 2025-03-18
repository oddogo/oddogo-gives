
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { PaymentData } from './types.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

export const createPaymentRecord = async (paymentData: PaymentData) => {
  console.log('Creating payment record with data:', paymentData);
  
  try {
    const { data: payment, error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    if (!payment) {
      throw new Error('No payment record was created');
    }

    console.log('Payment record created successfully:', payment);
    return payment;
  } catch (error) {
    console.error('Exception in createPaymentRecord:', error);
    throw error;
  }
};

export const getFingerprintId = async (recipientId: string) => {
  console.log('Getting fingerprint for recipient ID:', recipientId);
  
  try {
    const { data: fingerprint, error: fingerprintError } = await supabaseClient
      .from('fingerprints_users')
      .select('fingerprint_id')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (fingerprintError) {
      console.error('Error fetching fingerprint:', fingerprintError);
      throw new Error(`Failed to fetch recipient fingerprint: ${fingerprintError.message}`);
    }

    if (!fingerprint?.fingerprint_id) {
      console.error('No fingerprint found for recipient:', recipientId);
      throw new Error(`No fingerprint found for recipient ID: ${recipientId}`);
    }

    console.log(`Found fingerprint ID ${fingerprint.fingerprint_id} for recipient ${recipientId}`);
    return fingerprint.fingerprint_id;
  } catch (error) {
    console.error(`Error in getFingerprintId for ${recipientId}:`, error);
    throw error;
  }
};

export const getUserId = async (authHeader: string | null) => {
  console.log('Getting user ID from auth header:', !!authHeader);
  
  if (!authHeader) {
    console.log('No auth header provided, proceeding as anonymous');
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
    
    console.log('Retrieved user ID:', user?.id || 'none');
    return user?.id || null;
  } catch (error) {
    console.error('Exception in getUserId:', error);
    return null;
  }
};
