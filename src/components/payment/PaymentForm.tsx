
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { paymentFormSchema, PaymentFormValues } from "./PaymentFormSchema";
import { useStripeInitialization } from "./useStripeInitialization";
import { usePaymentSubmit } from "./usePaymentSubmit";
import { PaymentFormFields } from "./PaymentFormFields";

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
  const stripePromise = useStripeInitialization();

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

  const { handleSubmit, isSubmitting } = usePaymentSubmit({
    recipientId,
    recipientName,
    campaignId,
    stripePromise,
    onSuccess,
  });

  const onSubmit = (values: PaymentFormValues) => {
    handleSubmit(values);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PaymentFormFields form={form} campaignId={campaignId} />
          
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
            All payments support {recipientName}&apos;s giving fingerprint.
            {campaignId && <br />Your donation will be linked to this campaign.}
          </p>
        </form>
      </Form>
    </div>
  );
};
