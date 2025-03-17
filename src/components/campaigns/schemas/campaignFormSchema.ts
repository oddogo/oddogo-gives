
import { z } from "zod";

export const campaignFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  target_amount: z.coerce
    .number()
    .min(1, "Target amount must be greater than 0"),
  end_date: z.date().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().nullable(),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
