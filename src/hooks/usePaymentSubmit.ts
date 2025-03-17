
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentDetails {
  amount: number;
  name: string;
  email: string;
  message?: string;
  campaign_id?: string;
}

interface PaymentSubmitProps {
  recipientId: string;
  recipientName: string;
  campaignId?: string;
  onSuccess?: (paymentId: string) => void;
  stripePromise: any;
}

export const usePaymentSubmit = ({
  recipientId,
  recipientName,
  campaignId,
  onSuccess,
  stripePromise,
}: PaymentSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const submitPayment = async (values: PaymentDetails) => {
    if (!stripePromise) {
      toast.error("Payment system is not available right now");
      setPaymentError("Payment system unavailable");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setPaymentError(null);
      
      const amountInCents = Math.round(values.amount * 100);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: amountInCents,
          name: values.name,
          email: values.email,
          message: values.message || "",
          recipient_id: recipientId,
          recipient_name: recipientName,
          campaign_id: values.campaign_id || campaignId || "",
          success_url: window.location.origin + "/payment-success?recipient_id=" + recipientId,
          cancel_url: window.location.origin + "/payment-cancelled",
        },
      });
      
      if (error) {
        console.error("Payment service error:", error);
        setPaymentError(error.message || "Payment service error");
        toast.error("Payment service error");
        return;
      }
      
      if (!data?.sessionId) {
        console.error("Missing session ID in response");
        setPaymentError("Could not create payment session");
        toast.error("Payment session creation failed");
        return;
      }
      
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (stripeError) {
        console.error("Stripe redirect error:", stripeError);
        setPaymentError(stripeError.message || "Payment redirect failed");
        toast.error("Payment redirect failed");
      }
      
      if (onSuccess) {
        onSuccess(data.sessionId);
      }
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      setPaymentError(error.message || "Payment processing error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitPayment,
    paymentError
  };
};
