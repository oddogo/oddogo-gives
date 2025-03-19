
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createStripeCheckoutSession } from "./stripe.ts";
import { createPaymentRecord } from "./db.ts";
import { PaymentRequest } from "./types.ts";
import { validatePaymentRequest } from "./validators.ts";

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
    // Parse request
    const body = await req.json();
    console.log('Received payment request:', JSON.stringify(body));
    
    // Validate request
    const validationResult = validatePaymentRequest(body);
    if (!validationResult.valid) {
      console.error('Validation error:', validationResult.errors);
      return new Response(
        JSON.stringify({ error: validationResult.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const paymentRequest = body as PaymentRequest;
    console.log('Payment request validated successfully:', JSON.stringify(paymentRequest));

    // First create a payment record in our database 
    const { paymentId, error: dbError } = await createPaymentRecord(paymentRequest);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: `Failed to create payment record: ${dbError}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment record created with ID:', paymentId);

    // Create Stripe checkout session with our payment ID in metadata
    const { session, error: stripeError } = await createStripeCheckoutSession({
      ...paymentRequest,
      internalPaymentId: paymentId,
    });

    if (stripeError || !session) {
      console.error('Stripe error:', stripeError);
      return new Response(
        JSON.stringify({ error: `Failed to create checkout session: ${stripeError}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Stripe session created:', session.id);
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        paymentId,
        url: session.url
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
