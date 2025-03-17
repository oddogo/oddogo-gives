
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
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
        
      if (error) {
        console.error("Error fetching campaign:", error);
        return;
      }
      
      setCampaign(data);
    };
    
    getCampaign();
  }, [campaignId]);
  
  // Event handler for successful payment - will be used to associate payment with campaign
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      // Associate payment with campaign
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
      // Since we can't modify PaymentForm directly (it's read-only),
      // we'll need to work with what's available or implement this
      // association logic elsewhere
    />
  );
};
