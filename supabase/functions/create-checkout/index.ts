
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";
import { corsHeaders } from '../get-stripe-key/types.ts';
import { validatePaymentRequest } from './validators.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    const requestData = await req.json();
    console.log('Received payment request data:', requestData);
    
    const { amount, email, name, message, recipient_id, recipient_name, campaign_id, success_url, cancel_url } = requestData;
    
    if (!amount || !email || !name || !recipient_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: campaign_id 
                ? `Donation to ${recipient_name}'s campaign`
                : `Donation to ${recipient_name}`,
              description: message ? `Message: ${message}` : undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: recipient_id,
      metadata: {
        name,
        recipient_id,
        recipient_name,
        campaign_id: campaign_id || '',
        message: message || '',
      },
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url,
    });
    
    console.log('Created checkout session:', session.id);

    // Return the session ID to the client
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
