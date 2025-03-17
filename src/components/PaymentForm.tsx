
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PaymentAmountSelector } from "./payment/PaymentAmountSelector";
import { PaymentDetailsFields } from "./payment/PaymentDetailsFields";
import { PaymentFooter } from "./payment/PaymentFooter";

const paymentFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Amount must be at least 1")
    .max(50000, "Amount cannot exceed 50,000"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
  campaign_id: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  recipientId: string;
  recipientName: string;
  campaignId?: string;
  onSuccess?: (paymentId: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  recipientId,
  recipientName,
  campaignId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      
      if (error) {
        console.error('Error fetching Stripe key:', error);
        return;
      }
      
      if (data?.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey));
      }
    };
    
    initializeStripe();
  }, []);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 25,
      name: "",
      email: "",
      message: "",
      campaign_id: campaignId || "",
    },
  });

  useEffect(() => {
    form.setValue("campaign_id", campaignId || "");
  }, [campaignId, form]);

  const onSubmit = async (values: PaymentFormValues) => {
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

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Donation Amount (£)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="25"
                  min={1}
                  step={1}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <PaymentAmountSelector form={form} />
        
        <PaymentDetailsFields form={form} />
        
        <input 
          type="hidden" 
          {...form.register("campaign_id")} 
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Donate £${form.watch("amount") || 0}`
          )}
        </Button>
        
        <PaymentFooter 
          recipientName={recipientName} 
          hasCampaign={!!campaignId} 
        />
      </form>
    </Form>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {formContent}
    </div>
  );
};
