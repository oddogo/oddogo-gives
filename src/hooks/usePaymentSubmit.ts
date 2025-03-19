
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
      
      // We send the amount as a number - the edge function will convert it to cents
      console.log("Submitting payment with data:", {
        amount: values.amount,
        recipientId,
        email: values.email,
        name: values.name,
        message: values.message,
        campaignId: values.campaign_id || campaignId
      });
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: values.amount,
          recipientId: recipientId,
          email: values.email,
          name: values.name,
          message: values.message || "",
          campaignId: values.campaign_id || campaignId || ""
        },
      });
      
      if (error) {
        console.error("Payment service error:", error);
        setPaymentError(error.message || "Payment service error");
        toast.error("Payment service error");
        return;
      }
      
      if (!data?.url) {
        console.error("Missing checkout URL in response:", data);
        setPaymentError("Could not create payment session");
        toast.error("Payment session creation failed");
        return;
      }
      
      console.log("Payment session created, redirecting to:", data.url);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
      if (onSuccess && data.paymentId) {
        onSuccess(data.paymentId);
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
