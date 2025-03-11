
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe with better error handling
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Missing Stripe secret key');
    }
    const stripe = Stripe(stripeKey);
    console.log('Stripe initialized');

    // Initialize Supabase client with better error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('Supabase client initialized');

    // Parse request body
    const { amount, recipientId } = await req.json();
    console.log('Received payment request:', { amount, recipientId });

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!recipientId) {
      throw new Error('Missing recipient ID');
    }

    // Get user from auth header with better error handling
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed');
    }

    if (!user) {
      throw new Error('No user found');
    }

    console.log('Authenticated user:', user.id);

    // Get recipient's fingerprint
    const { data: fingerprint, error: fingerprintError } = await supabaseClient
      .from('fingerprints_users')
      .select('fingerprint_id')
      .eq('user_id', recipientId)
      .single();

    if (fingerprintError) {
      console.error('Error fetching fingerprint:', fingerprintError);
      throw new Error('Failed to fetch recipient fingerprint');
    }

    if (!fingerprint?.fingerprint_id) {
      throw new Error('No fingerprint found for recipient');
    }

    console.log('Found fingerprint:', fingerprint.fingerprint_id);

    // Create payment record with full error handling
    const paymentData = {
      amount: amount,
      currency: 'gbp',
      user_id: user.id,
      fingerprint_id: fingerprint.fingerprint_id,
      status: 'pending'
    };

    const { error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .insert([paymentData]);

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log('Payment record created');

    // Create Stripe checkout session with better error handling
    const origin = req.headers.get('origin');
    if (!origin) {
      throw new Error('Missing origin header');
    }

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
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-cancelled`,
      metadata: {
        recipientId,
        fingerprintId: fingerprint.fingerprint_id,
        userId: user.id
      },
    });

    console.log('Stripe session created:', { sessionId: session.id });

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error creating payment:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment session' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
