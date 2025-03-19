
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { toast } from "sonner";

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
        console.log(`Loading campaign data for user: ${userId}`);
        
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
        console.log("Found active campaign:", campaignData.id, campaignData.title);
        
        // Directly query stripe_payments table for completed and pending payments
        if (campaignData.id) {
          const campaignId = campaignData.id;
          
          // Get completed payments amount
          const { data: completedPayments, error: completedError } = await supabase
            .from('stripe_payments')
            .select('amount')
            .eq('campaign_id', campaignId)
            .eq('status', 'completed');
            
          if (completedError) {
            console.error("Error fetching completed payments:", completedError);
          } else {
            const completedAmount = completedPayments.reduce((sum, payment) => 
              sum + (payment.amount || 0), 0);
            setTotalAmount(completedAmount);
            console.log(`Campaign ${campaignId} completed amount:`, completedAmount);
          }
          
          // Get pending payments amount
          const { data: pendingPayments, error: pendingError } = await supabase
            .from('stripe_payments')
            .select('amount')
            .eq('campaign_id', campaignId)
            .in('status', ['pending', 'processing']);
            
          if (pendingError) {
            console.error("Error fetching pending payments:", pendingError);
          } else {
            const calculatedPendingAmount = pendingPayments.reduce((sum, payment) => 
              sum + (payment.amount || 0), 0);
            setPendingAmount(calculatedPendingAmount);
            console.log(`Campaign ${campaignId} pending amount:`, calculatedPendingAmount);
          }
        }
      } catch (error) {
        console.error("Error loading campaign data:", error);
        toast.error("Failed to load campaign data");
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
