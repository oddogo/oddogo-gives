
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PaymentFormValues } from "@/components/PaymentForm";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface PaymentAmountSelectorProps {
  form: UseFormReturn<PaymentFormValues>;
}

export const PaymentAmountSelector: React.FC<PaymentAmountSelectorProps> = ({ form }) => {
  const presetAmounts = [10, 25, 50, 100];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {presetAmounts.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => form.setValue("amount", amount, { shouldValidate: true })}
            className={`flex-1 ${
              form.watch("amount") === amount 
                ? "bg-primary text-primary-foreground border-primary" 
                : ""
            }`}
          >
            £{amount}
          </Button>
        ))}
      </div>
      
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700">Custom Amount (£)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter custom amount"
                {...field}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(isNaN(value) ? 0 : value);
                }}
                min={1}
                className="w-full"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
