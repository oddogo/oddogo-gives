
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStripeInitialization } from "@/hooks/useStripeInitialization";
import { usePaymentSubmit } from "@/hooks/usePaymentSubmit";
import { PaymentFormContent } from "./payment/PaymentFormContent";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  campaignTitle?: string;
  onSuccess?: (paymentId: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  recipientId,
  recipientName,
  campaignId,
  campaignTitle,
  onSuccess,
}) => {
  const { stripePromise, isStripeLoading, stripeError } = useStripeInitialization();
  
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

  const { isSubmitting, submitPayment } = usePaymentSubmit({
    recipientId,
    recipientName,
    campaignId,
    onSuccess,
    stripePromise,
  });

  useEffect(() => {
    form.setValue("campaign_id", campaignId || "");
  }, [campaignId, form]);

  if (isStripeLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stripeError} 
          </AlertDescription>
        </Alert>
        <p className="text-center text-gray-500 mt-2">
          Our payment system is currently unavailable. Please try again later or contact support for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <PaymentFormContent
        form={form}
        isSubmitting={isSubmitting}
        recipientName={recipientName}
        campaignId={campaignId}
        campaignTitle={campaignTitle}
        onSubmit={submitPayment}
      />
    </div>
  );
};
