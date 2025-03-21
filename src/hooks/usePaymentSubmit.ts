
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { toast } from "sonner";

interface PaymentFormData {
  amount: number;
  name: string;
  email: string;
  message?: string;
}

interface PaymentOptions {
  recipientId: string;
  recipientName: string;
  campaignId?: string;
  campaignTitle?: string;
  campaignSlug?: string;
}

interface PaymentResult {
  success: boolean;
  error: string | null;
  paymentId: string | null;
}

export function usePaymentSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);

  const initializeStripe = async () => {
    if (stripeInstance) return stripeInstance;

    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      
      if (error) {
        throw new Error(`Error fetching Stripe key: ${error.message}`);
      }
      
      if (!data?.publishableKey) {
        throw new Error('No Stripe publishable key returned');
      }
      
      const newStripeInstance = await loadStripe(data.publishableKey);
      setStripeInstance(newStripeInstance);
      return newStripeInstance;
    } catch (error) {
      console.error('Error initializing Stripe:', error);
      toast.error('Failed to initialize payment system');
      return null;
    }
  };

  const submitPayment = async (
    formData: PaymentFormData,
    options: PaymentOptions
  ): Promise<PaymentResult> => {
    try {
      setIsSubmitting(true);
      
      // Initialize Stripe if not already done
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error('Could not initialize Stripe');
      }
      
      // Get origin for absolute URLs
      const origin = window.location.origin;
      
      // Create payment record and get checkout session from our API
      const payload = {
        amount: formData.amount,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        recipientId: options.recipientId,
        recipientName: options.recipientName,
        campaignId: options.campaignId,
        campaignTitle: options.campaignTitle,
        campaignSlug: options.campaignSlug,
        successUrl: `${origin}/payment-success`,
        cancelUrl: `${origin}/payment-cancelled`
      };

      console.log('Submitting payment with options:', payload);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: payload
      });
      
      if (error) {
        throw new Error(`Error creating payment: ${error.message}`);
      }
      
      if (!data?.sessionId) {
        throw new Error('No session ID returned from payment creation');
      }
      
      // Get the payment ID from the response
      const paymentId = data.paymentId;
      
      if (!paymentId) {
        throw new Error('No payment ID returned from payment creation');
      }
      
      console.log('Payment created successfully with ID:', paymentId);
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });
      
      if (stripeError) {
        throw new Error(`Stripe checkout error: ${stripeError.message}`);
      }
      
      return { success: true, error: null, paymentId };
    } catch (error: any) {
      console.error('Payment submission error:', error);
      toast.error(`Payment failed: ${error.message}`);
      return { success: false, error: error.message, paymentId: null };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitPayment
  };
}
