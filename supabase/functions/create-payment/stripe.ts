
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
    
    // Always use a complete URL for Stripe - empty domain is not valid for Stripe
    // Default to a vercel.app preview URL if no domain is specified
    const domain = Deno.env.get('PUBLIC_APP_URL') || 'https://oddogo-app.vercel.app';
    console.log('Using domain for redirects:', domain);
    
    // Build success URL with query parameters
    const successParams = new URLSearchParams();
    successParams.append('payment_id', internalPaymentId);
    if (campaignId) successParams.append('campaign_id', campaignId);
    if (recipientId) successParams.append('recipient_id', recipientId);
    
    // Always use absolute URLs for Stripe
    const successUrl = `${domain}/payment-success?${successParams.toString()}`;
    const cancelUrl = `${domain}/payment-cancelled`;
    
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);
    
    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp', // Changed from 'usd' to 'gbp'
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
