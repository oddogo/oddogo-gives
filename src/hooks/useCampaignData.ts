
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
        
        // Get payments for this campaign using campaign_payments junction table
        if (campaignData.id) {
          // Query the campaign_payments table to get all payment IDs associated with this campaign
          const { data: campaignPaymentsData, error: cpError } = await supabase
            .from('campaign_payments')
            .select('payment_id')
            .eq('campaign_id', campaignData.id);
            
          if (cpError) {
            console.error("Error fetching campaign payment IDs:", cpError);
            setLoading(false);
            return;
          }
          
          if (!campaignPaymentsData || campaignPaymentsData.length === 0) {
            console.log("No payments found for campaign:", campaignData.id);
            setTotalAmount(0);
            setPendingAmount(0);
            setLoading(false);
            return;
          }
          
          // Extract the payment IDs
          const paymentIds = campaignPaymentsData.map(cp => cp.payment_id);
          console.log(`Found ${paymentIds.length} payments linked to campaign ${campaignData.id}:`, paymentIds);
          
          // Now fetch the actual payment data using these IDs
          const { data: payments, error: paymentsError } = await supabase
            .from('stripe_payments')
            .select('id, amount, status')
            .in('id', paymentIds);
            
          if (paymentsError) {
            console.error("Error fetching campaign payment details:", paymentsError);
            setLoading(false);
            return;
          }
          
          if (!payments || payments.length === 0) {
            console.log("No payment details found for campaign payment IDs");
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
