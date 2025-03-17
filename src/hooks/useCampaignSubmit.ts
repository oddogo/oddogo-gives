
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
        toast.error("You must be logged in to create a campaign");
        navigate("/auth");
        return;
      }
      
      console.log("Creating campaign with data:", {
        ...values, 
        target_amount: amountInCents,
        user_id: user.id
      });
      
      // Prepare the data
      const campaignData = {
        title: values.title,
        description: values.description,
        target_amount: amountInCents,
        end_date: values.end_date?.toISOString(),
        image_url: values.image_url || null,
        user_id: user.id // Add the user_id
      };
      
      if (campaign) {
        // Update existing campaign
        const { data, error } = await supabase
          .from("campaigns")
          .update(campaignData)
          .eq("id", campaign.id)
          .select();
          
        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message || "Error updating campaign");
        }
        
        console.log("Campaign updated successfully:", data);
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        const { data, error } = await supabase
          .from("campaigns")
          .insert(campaignData)
          .select("slug")
          .single();
          
        if (error) {
          console.error("Database error:", error);
          throw new Error(error.message || "Error creating campaign");
        }
        
        console.log("Campaign created successfully:", data);
        toast.success("Campaign created successfully");
        
        // Navigate to the new campaign page
        if (data?.slug) {
          navigate(`/campaigns/${data.slug}`);
        }
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error(error.message || "Failed to save campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
