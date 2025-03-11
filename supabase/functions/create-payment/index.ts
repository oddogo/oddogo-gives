
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
    console.log('Stripe initialized');

    const { amount, recipientId } = await req.json();
    console.log('Received payment request:', { amount, recipientId });

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    // Create a record in stripe_payments table
    const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1]);
    
    const { data: fingerprint, error: fingerprintError } = await supabase
      .from('fingerprints_users')
      .select('fingerprint_id')
      .eq('user_id', recipientId)
      .single();

    if (fingerprintError) {
      console.error('Error fetching fingerprint:', fingerprintError);
    }

    const paymentData = {
      amount: amount,
      currency: 'gbp',
      user_id: user?.id,
      fingerprint_id: fingerprint?.fingerprint_id,
      status: 'pending'
    };

    const { error: paymentError } = await supabase
      .from('stripe_payments')
      .insert([paymentData]);

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
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
      success_url: `${req.headers.get('origin')}/payment-success`,
      cancel_url: `${req.headers.get('origin')}/payment-cancelled`,
      metadata: {
        recipientId,
        fingerprintId: fingerprint?.fingerprint_id
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
