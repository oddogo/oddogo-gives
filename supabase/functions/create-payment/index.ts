import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  recipientId: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  user_id: string | null;
  fingerprint_id: string;
  status: string;
}

const validatePaymentRequest = (data: any): { isValid: boolean; error?: string } => {
  const { amount, recipientId } = data;
  const numericAmount = Number(amount);

  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    return { isValid: false, error: 'Invalid amount provided' };
  }

  if (!recipientId) {
    return { isValid: false, error: 'Missing recipient ID' };
  }

  return { isValid: true };
};

const initializeSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

const initializeStripe = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Missing Stripe configuration');
  }
  return new Stripe(stripeKey);
};

const getUserIdFromAuth = async (authHeader: string | null, supabase: any) => {
  if (!authHeader) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    return user?.id || null;
  } catch (error) {
    console.log('Auth error, continuing as anonymous donation:', error.message);
    return null;
  }
};

const getRecipientFingerprint = async (supabase: any, recipientId: string) => {
  const { data: fingerprint, error: fingerprintError } = await supabase
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

const createPaymentRecord = async (supabase: any, paymentData: PaymentData) => {
  const { data: payment, error: paymentError } = await supabase
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

const createStripeSession = async (
  stripe: Stripe,
  amount: number,
  origin: string,
  payment: any,
  recipientId: string,
  fingerprintId: string,
  userId: string | null
) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Donation',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/payment-success?payment_id=${payment.id}&recipient_id=${recipientId}`,
    cancel_url: `${origin}/payment-cancelled`,
    metadata: {
      payment_id: payment.id,
      recipientId,
      fingerprintId,
      userId: userId || 'anonymous'
    },
  });

  const { error: updateError } = await supabase
    .from('stripe_payments')
    .update({ 
      stripe_payment_intent_id: session.payment_intent,
      stripe_client_secret: session.client_secret
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating payment record with Stripe IDs:', updateError);
  }

  return session;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = initializeStripe();
    const supabase = initializeSupabase();
    console.log('Services initialized');

    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    const validation = validatePaymentRequest(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { amount, recipientId } = requestData;
    const amountInCents = Math.round(Number(amount) * 100);

    const userId = await getUserIdFromAuth(req.headers.get('Authorization'), supabase);
    console.log('User authentication processed:', userId ? 'authenticated' : 'anonymous');

    const fingerprintId = await getRecipientFingerprint(supabase, recipientId);
    console.log('Found fingerprint:', fingerprintId);

    const payment = await createPaymentRecord(supabase, {
      amount: amountInCents,
      currency: 'gbp',
      user_id: userId,
      fingerprint_id: fingerprintId,
      status: 'pending'
    });
    console.log('Payment record created:', payment.id);

    const origin = req.headers.get('origin');
    if (!origin) {
      return new Response(
        JSON.stringify({ error: 'Missing origin header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const session = await createStripeSession(
      stripe,
      amountInCents,
      origin,
      payment,
      recipientId,
      fingerprintId,
      userId
    );
    console.log('Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process payment',
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
