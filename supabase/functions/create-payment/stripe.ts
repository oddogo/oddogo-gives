
import { Stripe } from "https://esm.sh/stripe@12.5.0?target=deno";
import { PaymentRequest } from "./types.ts";

export async function createStripeCheckoutSession(
  paymentRequest: PaymentRequest & { internalPaymentId: string }
) {
  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return { session: null, error: 'Stripe key not configured' };
    }
    
    const stripe = new Stripe(stripeKey);
    const { 
      amount, 
      name, 
      email, 
      recipientId, 
      campaignId, 
      campaignTitle, 
      campaignSlug, 
      internalPaymentId,
      successUrl,
      cancelUrl
    } = paymentRequest;
    
    // Build success URL with query parameters
    const successParams = new URLSearchParams();
    successParams.append('payment_id', internalPaymentId);
    if (campaignId) successParams.append('campaign_id', campaignId);
    if (recipientId) successParams.append('recipient_id', recipientId);
    
    // Use the client-provided URLs
    const fullSuccessUrl = `${successUrl}?${successParams.toString()}`;
    const fullCancelUrl = cancelUrl;
    
    // Validate the amount
    const validAmount = Number(amount);
    if (isNaN(validAmount) || validAmount <= 0) {
      return { session: null, error: 'Invalid amount' };
    }
    
    // Convert amount from pounds to pence (ensure it's an integer)
    const amountInPence = Math.round(validAmount * 100);
    
    console.log('Payment configuration:');
    console.log('- Success URL:', fullSuccessUrl);
    console.log('- Cancel URL:', fullCancelUrl);
    console.log('- Payment ID:', internalPaymentId);
    console.log('- Amount (pounds):', validAmount);
    console.log('- Amount (pence for Stripe):', amountInPence);
    console.log('- Customer email:', email);
    
    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: campaignTitle || `Donation to ${name || 'charity causes'}`,
              description: campaignTitle ? `Supporting ${campaignTitle}` : 'Thank you for your donation',
            },
            unit_amount: amountInPence, // Use the converted amount in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: fullSuccessUrl,
      cancel_url: fullCancelUrl,
      customer_email: email,
      receipt_email: email, // Add receipt_email so we can find by email if needed
      metadata: {
        payment_id: internalPaymentId,
        user_id: recipientId || '',
        campaign_id: campaignId || '',
        campaign_slug: campaignSlug || '',
        campaign_title: campaignTitle || '',
        donor_name: name || '',
        donor_email: email || '', // Add donor email to metadata for easier lookup
        amount_pounds: validAmount.toString() // Store the original amount in pounds for reference
      }
    });
    
    console.log('Stripe session created:', session.id);
    console.log('Session payment intent:', session.payment_intent);
    console.log('Session amount total (pence):', session.amount_total);
    console.log('Original amount (pounds):', validAmount);

    // After creating the session, update our payment record with the payment_intent_id
    if (session.payment_intent) {
      // Update the payment record with the Stripe payment intent ID immediately
      const { updateError } = await updatePaymentWithSessionInfo(internalPaymentId, session);
      if (updateError) {
        console.warn('Warning: Could not update payment record with session info:', updateError);
      }
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { session: null, error: error.message };
  }
}

// Helper function to update payment with session information
async function updatePaymentWithSessionInfo(paymentId: string, session: any) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { error } = await supabaseClient
      .from('stripe_payments')
      .update({
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'processing'
      })
      .eq('id', paymentId);
      
    return { error };
  } catch (updateError) {
    console.error('Error updating payment with session info:', updateError);
    return { updateError };
  }
}

// Add the missing import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
