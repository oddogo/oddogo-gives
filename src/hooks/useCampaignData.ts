import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";

interface CampaignData {
  campaign: Campaign | null;
  totalAmount: number;
  loading: boolean;
}

export function useCampaignData(userId: string): CampaignData {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        
        // Get the active campaign for this user
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (campaignError) {
          console.error("Error loading campaign:", campaignError);
          setLoading(false);
          return;
        }
        
        if (!campaignData) {
          console.log("No active campaign found for user:", userId);
          setLoading(false);
          return;
        }
        
        setCampaign(campaignData as Campaign);
        
        // Get payment data in a simplified manner
        const { data: paymentData, error: paymentsError } = await supabase
          .from('v_stripe_payments')
          .select('amount')
          .eq('campaign_id', campaignData.id);
          
        if (paymentsError) {
          console.error("Error fetching campaign payments:", paymentsError);
          setLoading(false);
          return;
        }
        
        // Calculate total amount using reduce to keep it simple
        const total = (paymentData || []).reduce((sum, payment) => {
          return sum + (Number(payment.amount) || 0);
        }, 0);
        
        setTotalAmount(total);
      } catch (error) {
        console.error("Error loading campaign data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadCampaign();
    }
  }, [userId]);

  return { campaign, totalAmount, loading };
}
