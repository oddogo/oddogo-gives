
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
    // Initialize Stripe
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

  // Update the campaignId if it changes
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
      
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(values.amount * 100);
      
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: amountInCents,
          name: values.name,
          email: values.email,
          message: values.message || "",
          recipient_id: recipientId,
          recipient_name: recipientName,
          campaign_id: values.campaign_id || campaignId || "", // Use form value or prop
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
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      // If payment is successful and we have a payment ID and onSuccess callback
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
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
          
          <div className="flex flex-wrap gap-2 mb-2">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("amount", amount, { shouldValidate: true })}
                className={`flex-1 ${
                  form.watch("amount") === amount ? "bg-primary/10 border-primary" : ""
                }`}
              >
                £{amount}
              </Button>
            ))}
          </div>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add a personal message..." 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Hidden field for campaign_id */}
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
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Your donation will be processed securely via Stripe.
            <br />
            All payments support {recipientName}'s giving fingerprint.
            {campaignId && <br />Your donation will be linked to this campaign.}
          </p>
        </form>
      </Form>
    </div>
  );
};
