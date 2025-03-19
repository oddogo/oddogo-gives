
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createStripeCheckoutSession } from "./stripe.ts";
import { createPaymentRecord } from "./db.ts";
import { PaymentRequest, validatePaymentRequest } from "./validators.ts";

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
    console.log('Payment request received:', paymentRequest);

    // First create a payment record in our database 
    const { paymentId, error: dbError } = await createPaymentRecord(paymentRequest);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: `Failed to create payment record: ${dbError}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    
    // Update our payment record with the Stripe session ID
    // This step is handled by the checkout.session.completed webhook

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
