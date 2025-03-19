
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PaymentAmountSelector } from "./PaymentAmountSelector";
import { PaymentDetailsFields } from "./PaymentDetailsFields";
import { PaymentFooter } from "./PaymentFooter";

interface PaymentFormContentProps {
  form: UseFormReturn<any>;
  isSubmitting: boolean;
  recipientName: string;
  campaignId?: string;
  onSubmit: (values: any) => void;
}

export const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  form,
  isSubmitting,
  recipientName,
  campaignId,
  onSubmit,
}) => {
  return (
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
};
