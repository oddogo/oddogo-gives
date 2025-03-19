
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
        
        // Get payment data through the campaign_payments table
        if (campaignData.id) {
          // First, get payment IDs associated with this campaign
          const { data: campaignPayments, error: campaignPaymentsError } = await supabase
            .from('campaign_payments')
            .select('payment_id')
            .eq('campaign_id', campaignData.id);
            
          if (campaignPaymentsError) {
            console.error("Error fetching campaign payment relations:", campaignPaymentsError);
            setLoading(false);
            return;
          }
          
          if (!campaignPayments || campaignPayments.length === 0) {
            console.log("No payments found for campaign:", campaignData.id);
            setTotalAmount(0);
            setLoading(false);
            return;
          }
          
          // Extract payment IDs
          const paymentIds = campaignPayments.map(item => item.payment_id);
          
          // Now fetch the actual payment data
          const { data: paymentData, error: paymentsError } = await supabase
            .from('v_stripe_payments')
            .select('amount')
            .in('id', paymentIds);
            
          if (paymentsError) {
            console.error("Error fetching payment details:", paymentsError);
            setLoading(false);
            return;
          }
          
          // Calculate total using a simple approach to avoid complex type issues
          let total = 0;
          if (paymentData && paymentData.length > 0) {
            for (const payment of paymentData) {
              if (payment.amount && typeof payment.amount === 'number') {
                total += payment.amount;
              }
            }
          }
          
          setTotalAmount(total);
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

  return { campaign, totalAmount, loading };
}
