
import React, { useState, useEffect } from "react";
import { PaymentForm } from "@/components/PaymentForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CampaignPaymentWrapperProps {
  campaignId: string;
  recipientId: string;
  recipientName: string;
}

export const CampaignPaymentWrapper: React.FC<CampaignPaymentWrapperProps> = ({ 
  campaignId,
  recipientId,
  recipientName
}) => {
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    const getCampaign = async () => {
      if (!campaignId) return;
      
      console.log("Fetching campaign details for campaign ID:", campaignId);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
        
      if (error) {
        console.error("Error fetching campaign:", error);
        return;
      }
      
      console.log("Campaign data loaded:", data);
      setCampaign(data);
    };
    
    getCampaign();
  }, [campaignId]);
  
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      console.log("Linking payment to campaign:", {paymentId, campaignId});
      
      const { error } = await supabase
        .from('campaign_payments')
        .insert({
          campaign_id: campaignId,
          payment_id: paymentId
        });
        
      if (error) {
        console.error("Error linking payment to campaign:", error);
        toast.error("Payment was successful but couldn't be linked to campaign");
        return;
      }
      
      toast.success("Payment successfully associated with the campaign!");
    } catch (err) {
      console.error("Error in payment success handler:", err);
    }
  };

  return (
    <PaymentForm 
      recipientId={recipientId} 
      recipientName={recipientName}
      campaignId={campaignId}
      campaignTitle={campaign?.title}
      campaignSlug={campaign?.slug}
      onSuccess={handlePaymentSuccess}
    />
  );
};
