
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';
import { corsHeaders, PaymentRequest } from './types.ts';
import { createPaymentRecord, recordPaymentLog } from './db.ts';
import { createStripeSession } from './stripe.ts';
import { validatePaymentRequest } from './validators.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsResponse = () => {
  return new Response('OK', {
    headers: corsHeaders,
    status: 200,
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsResponse();
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      headers: corsHeaders,
      status: 405,
    });
  }

  try {
    const requestData = await req.json();
    console.log('Received payment request:', JSON.stringify(requestData));

    // Validate the payment request
    const validationResult = validatePaymentRequest(requestData);
    if (!validationResult.isValid) {
      console.error('Payment validation failed:', validationResult.error);
      return new Response(JSON.stringify({ error: validationResult.error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Extract payment request data
    const { amount, recipientId, email, name, message, campaignId } = requestData as PaymentRequest;
    const amountInCents = Math.round(amount * 100);
    const fingerprint_id = crypto.randomUUID();
    const user_id = await getUserIdFromRequest(req);
    
    console.log('Processing payment with data:', {
      amount,
      amountInCents,
      recipientId,
      email,
      name,
      messageExists: !!message,
      campaignIdExists: !!campaignId,
      fingerprint_id,
      user_id
    });

    try {
      // Create payment record in database
      const payment = await createPaymentRecord({
        amount: amountInCents,
        currency: 'gbp',
        fingerprint_id,
        user_id,
        status: 'pending',
        stripe_payment_email: email,
        message,
        campaignId,
        donor_name: name
      });

      console.log('Payment record created:', payment.id);
      
      // Create Stripe checkout session
      const origin = new URL(req.url).origin;
      const session = await createStripeSession(
        stripe,
        amountInCents,
        origin,
        payment,
        recipientId,
        fingerprint_id,
        user_id,
        email,
        name,
        message,
        campaignId
      );

      console.log('Stripe session created successfully:', session.id);
      
      // Record success in logs
      await recordPaymentLog(
        payment.id,
        'created',
        'Stripe session created successfully',
        { session_id: session.id }
      );
      
      // Return success response with session URL
      return new Response(
        JSON.stringify({
          success: true,
          url: session.url,
          payment_id: payment.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error creating payment:', error);
      
      // Record error in logs
      await recordPaymentLog(
        'none',
        'error',
        `Error creating payment: ${error.message}`,
        { error: String(error) }
      );
      
      return new Response(
        JSON.stringify({ error: `Payment processing error: ${error.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('Server error processing payment request:', error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.warn('Failed to get user from token:', error);
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
}
