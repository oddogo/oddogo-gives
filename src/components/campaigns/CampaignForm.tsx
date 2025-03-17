
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Campaign } from "@/types/campaign";
import { Form } from "@/components/ui/form";
import { CampaignFormFields } from "./CampaignFormFields";
import { CampaignFormActions } from "./CampaignFormActions";
import { campaignFormSchema, CampaignFormValues } from "./schemas/campaignFormSchema";
import { useCampaignSubmit } from "@/hooks/useCampaignSubmit";
import { toast } from "sonner";

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
    mode: "onChange",
  });

  const { handleSubmit: submitHandler, isSubmitting } = useCampaignSubmit({ campaign, onSuccess });

  const onSubmit = async (values: CampaignFormValues) => {
    console.log("Form submitted with values:", values);
    await submitHandler(values);
  };

  // For debugging: Log validation errors
  useEffect(() => {
    const subscription = form.formState.subscribe(state => {
      if (Object.keys(state.errors).length > 0) {
        console.log("Form has validation errors:", state.errors);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.formState]);

  // Debug form submission attempts
  const handleFormSubmit = form.handleSubmit((values) => {
    console.log("Form is valid, submitting with values:", values);
    onSubmit(values);
  }, (errors) => {
    console.error("Form submission failed with errors:", errors);
    toast.error("Please fix the highlighted errors before submitting");
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <CampaignFormFields form={form} />
        <CampaignFormActions
          isSubmitting={isSubmitting}
          campaign={campaign}
        />
      </form>
    </Form>
  );
};
