
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";
import { PaymentAmountButtons } from "./PaymentAmountButtons";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PaymentFormFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
  campaignId?: string;
}

export const PaymentFormFields: React.FC<PaymentFormFieldsProps> = ({
  form,
  campaignId,
}) => {
  return (
    <>
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
      
      <PaymentAmountButtons form={form} />
      
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
      
      <input 
        type="hidden" 
        {...form.register("campaign_id")} 
      />
    </>
  );
};
