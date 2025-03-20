
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
    
    console.log('Payment configuration:');
    console.log('- Success URL:', fullSuccessUrl);
    console.log('- Cancel URL:', fullCancelUrl);
    console.log('- Payment ID:', internalPaymentId);
    console.log('- Amount:', amount);
    
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
            unit_amount: Math.round(amount * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: fullSuccessUrl,
      cancel_url: fullCancelUrl,
      customer_email: email,
      metadata: {
        payment_id: internalPaymentId,
        user_id: recipientId || '',
        campaign_id: campaignId || '',
        campaign_slug: campaignSlug || '',
        campaign_title: campaignTitle || '',
        donor_name: name || ''
      }
    });
    
    console.log('Stripe session created:', session.id);
    console.log('Session amount:', session.amount_total);
    return { session, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { session: null, error: error.message };
  }
}
