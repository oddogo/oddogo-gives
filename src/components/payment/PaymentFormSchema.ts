
import { z } from "zod";

export const paymentFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Amount must be at least 1")
    .max(50000, "Amount cannot exceed 50,000"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
  campaign_id: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
