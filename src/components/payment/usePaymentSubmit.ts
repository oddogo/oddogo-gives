
import { useState } from "react";
import { PaymentFormValues } from "./PaymentFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsePaymentSubmitProps {
  recipientId: string;
  recipientName: string;
  campaignId?: string;
  stripePromise: any;
  onSuccess?: (paymentId: string) => void;
}

export function usePaymentSubmit({
  recipientId,
  recipientName,
  campaignId,
  stripePromise,
  onSuccess,
}: UsePaymentSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: PaymentFormValues) => {
    if (!stripePromise) {
      toast.error("Payment system is not available right now");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
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
          success_url: window.location.origin + "/payment-success",
          cancel_url: window.location.origin + "/payment-cancelled",
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data?.sessionId) {
        throw new Error("Failed to create checkout session");
      }
      
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (data.paymentId && onSuccess) {
        onSuccess(data.paymentId);
      }
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    handleSubmit, 
    isSubmitting 
  };
}
