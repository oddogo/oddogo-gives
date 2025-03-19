
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";

interface CampaignData {
  campaign: Campaign | null;
  totalAmount: number;
  pendingAmount: number;
  loading: boolean;
}

export function useCampaignData(userId: string): CampaignData {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

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
        
        // Get payments directly associated with campaign_id - simplified approach
        if (campaignData.id) {
          const { data: payments, error: paymentsError } = await supabase
            .from('stripe_payments')
            .select('id, amount, status')
            .eq('campaign_id', campaignData.id);
            
          if (paymentsError) {
            console.error("Error fetching campaign payments:", paymentsError);
            setLoading(false);
            return;
          }
          
          if (!payments || payments.length === 0) {
            console.log("No payments found for campaign:", campaignData.id);
            setTotalAmount(0);
            setPendingAmount(0);
            setLoading(false);
            return;
          }
          
          let completedAmount = 0;
          let pendingAmount = 0;
          
          for (const payment of payments) {
            if (payment.amount && typeof payment.amount === 'number') {
              if (payment.status === 'completed') {
                completedAmount += payment.amount;
              } else if (payment.status === 'pending') {
                pendingAmount += payment.amount;
              }
            }
          }
          
          console.log(`Campaign ${campaignData.id} payments:`, {
            total: payments.length, 
            completed: completedAmount,
            pending: pendingAmount
          });
          
          setTotalAmount(completedAmount);
          setPendingAmount(pendingAmount);
        }
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

  return { campaign, totalAmount, pendingAmount, loading };
}
