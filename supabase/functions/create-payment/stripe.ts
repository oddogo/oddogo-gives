
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
    const { amount, name, email, recipientId, campaignId, campaignTitle, campaignSlug, internalPaymentId } = paymentRequest;
    
    // Build success URL with query parameters
    const successParams = new URLSearchParams();
    successParams.append('payment_id', internalPaymentId);
    if (campaignId) successParams.append('campaign_id', campaignId);
    if (recipientId) successParams.append('recipient_id', recipientId);
    
    // For Stripe, we need to use absolute URLs with the correct domain
    // Use the current deployment URL with fallback to Vercel URL
    const baseUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://oddogo-app.vercel.app';
    const successUrl = `${baseUrl}/payment-success?${successParams.toString()}`;
    const cancelUrl = `${baseUrl}/payment-cancelled`;
    
    console.log('Payment configuration:');
    console.log('- Base URL for redirects:', baseUrl);
    console.log('- Success URL:', successUrl);
    console.log('- Cancel URL:', cancelUrl);
    console.log('- Payment ID:', internalPaymentId);
    
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
            unit_amount: amount * 100, // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
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
    return { session, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { session: null, error: error.message };
  }
}
