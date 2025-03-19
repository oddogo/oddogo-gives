
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PaymentAmountSelector } from "./PaymentAmountSelector";
import { PaymentDetailsFields } from "./PaymentDetailsFields";
import { PaymentFooter } from "./PaymentFooter";
import { Textarea } from "@/components/ui/textarea";

interface PaymentFormContentProps {
  form: UseFormReturn<{
    amount: number;
    name: string;
    email: string;
    message?: string;
    campaign_id?: string;
  }>;
  isSubmitting: boolean;
  recipientName: string;
  campaignId?: string;
  campaignTitle?: string;
  onSubmit: (values: any) => void;
}

export const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  form,
  isSubmitting,
  recipientName,
  campaignId,
  campaignTitle,
  onSubmit,
}) => {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {campaignTitle ? (
          <div className="mb-6 text-center">
            <span className="text-sm text-gray-500">Supporting</span>
            <h3 className="text-xl font-semibold text-gray-900">{campaignTitle}</h3>
          </div>
        ) : (
          <h3 className="text-xl font-semibold text-center mb-6">
            Support {recipientName}
          </h3>
        )}

        <PaymentAmountSelector form={form} />
        <PaymentDetailsFields form={form} />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a personal message..."
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full py-6 text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Make Payment"}
        </Button>

        <PaymentFooter 
          recipientName={recipientName} 
          hasCampaign={!!campaignId} 
        />
      </form>
    </Form>
  );
};
