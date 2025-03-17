
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign } from "@/types/campaign";
import { Form } from "@/components/ui/form";
import { CampaignFormFields } from "./CampaignFormFields";
import { CampaignFormActions } from "./CampaignFormActions";
import { campaignFormSchema, CampaignFormValues } from "./schemas/campaignFormSchema";
import { useCampaignSubmit } from "@/hooks/useCampaignSubmit";

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess?: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ campaign, onSuccess }) => {
  const defaultValues = campaign 
    ? {
        title: campaign.title,
        description: campaign.description || "",
        target_amount: campaign.target_amount / 100, // Convert from cents to pounds/dollars
        end_date: campaign.end_date ? new Date(campaign.end_date) : undefined,
        image_url: campaign.image_url,
      }
    : {
        title: "",
        description: "",
        target_amount: 100, // Default 100 pounds/dollars
        end_date: undefined,
        image_url: "",
      };

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues,
  });

  const { handleSubmit, isSubmitting } = useCampaignSubmit({ campaign, onSuccess });

  const onSubmit = (values: CampaignFormValues) => {
    handleSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CampaignFormFields form={form} />
        <CampaignFormActions
          isSubmitting={isSubmitting}
          campaign={campaign}
        />
      </form>
    </Form>
  );
};
