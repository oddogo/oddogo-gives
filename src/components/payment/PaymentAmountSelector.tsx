
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { PaymentFormValues } from "@/components/PaymentForm";

interface PaymentAmountSelectorProps {
  form: UseFormReturn<PaymentFormValues>;
}

export const PaymentAmountSelector: React.FC<PaymentAmountSelectorProps> = ({ form }) => {
  const presetAmounts = [10, 25, 50, 100];
  
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {presetAmounts.map((amount) => (
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
  );
};
