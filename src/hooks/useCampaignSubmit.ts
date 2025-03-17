
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { CampaignFormValues } from "@/components/campaigns/schemas/campaignFormSchema";

interface UseCampaignSubmitProps {
  campaign?: Campaign;
  onSuccess?: () => void;
}

export const useCampaignSubmit = ({ campaign, onSuccess }: UseCampaignSubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CampaignFormValues) => {
    try {
      console.log("Starting campaign submission with values:", values);
      setIsSubmitting(true);
      const amountInCents = Math.round(values.target_amount * 100);
      
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Authentication error:", authError);
        toast.error("Authentication error. Please try logging in again.");
        navigate("/auth");
        return;
      }
      
      if (!user) {
        console.error("No authenticated user found");
        toast.error("You must be logged in to create a campaign");
        navigate("/auth");
        return;
      }
      
      console.log("Creating campaign for user:", user.id);
      
      // Prepare the data
      const campaignData = {
        title: values.title,
        description: values.description,
        target_amount: amountInCents,
        end_date: values.end_date ? values.end_date.toISOString() : null,
        image_url: values.image_url || null,
        user_id: user.id
      };
      
      console.log("Prepared campaign data:", campaignData);
      
      if (campaign) {
        // Update existing campaign
        console.log("Updating existing campaign:", campaign.id);
        const { data, error } = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", campaign.id)
          .select();
          
        if (error) {
          console.error("Database error during update:", error);
          throw new Error(error.message || "Error updating campaign");
        }
        
        console.log("Campaign updated successfully:", data);
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        console.log("Creating new campaign");
        const { data, error } = await supabase
          .from("campaigns")
          .insert(campaignData)
          .select("slug, id")
          .single();
          
        if (error) {
          console.error("Database error during creation:", error);
          throw new Error(error.message || "Error creating campaign");
        }
        
        console.log("Campaign created successfully:", data);
        toast.success("Campaign created successfully");
        
        // Navigate to the new campaign page
        if (data?.slug) {
          console.log("Navigating to new campaign:", data.slug);
          navigate(`/campaigns/${data.slug}`);
        }
      }
      
      if (onSuccess) {
        console.log("Calling onSuccess callback");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
