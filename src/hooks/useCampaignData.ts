
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";

interface CampaignPayment {
  id: string;
  amount: number;
  status: string;
}

interface CampaignData {
  campaign: Campaign | null;
  completedAmount: number;
  pendingAmount: number;
  loading: boolean;
}

export function useCampaignData(userId: string): CampaignData {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        
        console.log("Loading active campaign for user:", userId);
        
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
          if (campaignError.code !== 'PGRST116') { // Not found error
            console.error("Error loading campaign:", campaignError);
          } else {
            console.log("No active campaign found for user:", userId);
          }
          setLoading(false);
          return;
        }
        
        if (!campaignData) {
          console.log("No active campaign data returned");
          setLoading(false);
          return;
        }
        
        console.log("Found active campaign:", campaignData);
        setCampaign(campaignData as Campaign);
        
        // Get all payments associated with this campaign
        const { data, error: paymentsError } = await supabase
          .from('v_stripe_payments')
          .select('id, amount, status')
          .eq('campaign_id', campaignData.id);
          
        if (paymentsError) {
          console.error("Error fetching campaign payments:", paymentsError);
          setLoading(false);
          return;
        }
        
        const payments: CampaignPayment[] = data || [];
        
        console.log("Campaign payments:", payments);
        
        if (payments.length === 0) {
          console.log("No payments associated with this campaign yet");
          setLoading(false);
          return;
        }
        
        // Calculate completed and pending amounts
        let completed = 0;
        let pending = 0;
        
        // Process the payments
        payments.forEach(payment => {
          if (payment.status === 'completed') {
            completed += payment.amount;
          } else if (payment.status === 'pending') {
            pending += payment.amount;
          }
        });
        
        console.log("Campaign payment amounts:", { completed, pending });
        setCompletedAmount(completed);
        setPendingAmount(pending);
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

  return { campaign, completedAmount, pendingAmount, loading };
}
