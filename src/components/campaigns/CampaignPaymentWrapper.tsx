
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCampaign = async () => {
      if (!campaignId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();
          
        if (error) {
          console.error("Error fetching campaign:", error);
          toast.error("Unable to load campaign details");
          return;
        }
        
        setCampaign(data);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    getCampaign();
  }, [campaignId]);
  
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
      
      toast.success("Your donation has been successfully processed and linked to the campaign!");
    } catch (err) {
      console.error("Error in payment success handler:", err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-4"></div>
      </div>
    );
  }

  return (
    <PaymentForm 
      recipientId={recipientId}
      recipientName={recipientName}
      campaignId={campaignId}
      onSuccess={handlePaymentSuccess}
    />
  );
};
