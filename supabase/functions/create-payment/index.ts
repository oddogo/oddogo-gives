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
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log('Checking Stripe key:', !!stripeKey);
    
    if (!stripeKey) {
      throw new Error('Missing Stripe configuration');
    }

    const stripe = new Stripe(stripeKey);
    console.log('Stripe initialized');

    // Parse request data
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const { amount, recipientId } = requestData;
    const numericAmount = Number(amount);

    // Validate amount
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate recipient
    if (!recipientId) {
      return new Response(
        JSON.stringify({ error: 'Missing recipient ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let userId = null;
    // Try to get authenticated user if available, but don't require it
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.log('Missing Supabase configuration, continuing as anonymous donation');
        } else {
          const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
          const { data: { user } } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
          );
          if (user) {
            userId = user.id;
            console.log('Authenticated user:', userId);
          }
        }
      } catch (error) {
        console.log('Auth error, continuing as anonymous donation:', error.message);
      }
    }

    // Get recipient's fingerprint
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get recipient's fingerprint
    const { data: fingerprint, error: fingerprintError } = await supabaseClient
      .from('fingerprints_users')
      .select('fingerprint_id')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (fingerprintError) {
      console.error('Error fetching fingerprint:', fingerprintError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recipient fingerprint' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!fingerprint?.fingerprint_id) {
      console.error('No fingerprint found for recipient:', recipientId);
      return new Response(
        JSON.stringify({ error: 'Recipient not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log('Found fingerprint:', fingerprint.fingerprint_id);

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(numericAmount * 100);
    console.log('Amount in cents:', amountInCents);

    // Create payment record
    const paymentData = {
      amount: amountInCents,
      currency: 'gbp',
      user_id: userId, // This can be null for anonymous donations
      fingerprint_id: fingerprint.fingerprint_id,
      status: 'pending'
    };

    const { data: payment, error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Payment record created:', payment.id);

    // Get origin for redirect URLs
    const origin = req.headers.get('origin');
    if (!origin) {
      return new Response(
        JSON.stringify({ error: 'Missing origin header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Donation',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-cancelled`,
      metadata: {
        payment_id: payment.id,
        recipientId,
        fingerprintId: fingerprint.fingerprint_id,
        userId: userId || 'anonymous'
      },
    });

    console.log('Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process payment',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
