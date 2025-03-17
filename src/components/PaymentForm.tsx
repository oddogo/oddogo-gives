
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStripeInitialization } from "@/hooks/useStripeInitialization";
import { usePaymentSubmit } from "@/hooks/usePaymentSubmit";
import { PaymentFormContent } from "./payment/PaymentFormContent";

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
  const { stripePromise, isStripeLoading } = useStripeInitialization();
  
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
        <p className="text-gray-500">Initializing payment system...</p>
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
        onSubmit={submitPayment}
      />
    </div>
  );
};
