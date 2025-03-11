
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_utils/stripe.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, userId } = await req.json()

    // Create payment record in database
    const { data: payment, error: dbError } = await supabaseAdmin
      .from('stripe_payments')
      .insert({
        user_id: userId,
        amount: amount,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'gbp',
      metadata: {
        paymentId: payment.id
      }
    })

    // Update payment record with Stripe details
    await supabaseAdmin
      .from('stripe_payments')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_client_secret: paymentIntent.client_secret
      })
      .eq('id', payment.id)

    // Log the payment creation
    await supabaseAdmin
      .from('stripe_payment_logs')
      .insert({
        payment_id: payment.id,
        status: 'created',
        message: 'Payment intent created',
        metadata: { stripe_payment_intent_id: paymentIntent.id }
      })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
