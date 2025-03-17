
import React from "react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";

interface PaymentAmountButtonsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export const PaymentAmountButtons: React.FC<PaymentAmountButtonsProps> = ({ form }) => {
  const predefinedAmounts = [10, 25, 50, 100];

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {predefinedAmounts.map((amount) => (
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
