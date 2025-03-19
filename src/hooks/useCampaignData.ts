
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
        
        // Get payment data through the campaign_payments table or direct campaign_id
        if (campaignData.id) {
          // Method 1: Get payment IDs associated through campaign_payments table
          const { data: campaignPayments, error: campaignPaymentsError } = await supabase
            .from('campaign_payments')
            .select('payment_id')
            .eq('campaign_id', campaignData.id);
            
          if (campaignPaymentsError) {
            console.error("Error fetching campaign payment relations:", campaignPaymentsError);
          }
          
          // Method 2: Get payments directly associated with campaign_id
          const { data: directPayments, error: directPaymentsError } = await supabase
            .from('stripe_payments')
            .select('id, amount, status')
            .eq('campaign_id', campaignData.id);
            
          if (directPaymentsError) {
            console.error("Error fetching direct campaign payments:", directPaymentsError);
          }
          
          // Combine payment IDs from both methods
          const paymentIds = new Set<string>();
          
          // Add payment IDs from campaign_payments relation
          if (campaignPayments && campaignPayments.length > 0) {
            campaignPayments.forEach(item => paymentIds.add(item.payment_id));
          }
          
          // Add direct payment IDs
          if (directPayments && directPayments.length > 0) {
            directPayments.forEach(payment => paymentIds.add(payment.id));
          }
          
          if (paymentIds.size === 0 && (!directPayments || directPayments.length === 0)) {
            console.log("No payments found for campaign:", campaignData.id);
            setTotalAmount(0);
            setPendingAmount(0);
            setLoading(false);
            return;
          }
          
          let completedAmount = 0;
          let pendingAmount = 0;
          
          // Process direct payments if any
          if (directPayments && directPayments.length > 0) {
            for (const payment of directPayments) {
              if (payment.amount && typeof payment.amount === 'number') {
                if (payment.status === 'completed') {
                  completedAmount += payment.amount;
                } else if (payment.status === 'pending') {
                  pendingAmount += payment.amount;
                }
              }
            }
          }
          
          // Fetch additional payments from campaign_payments relation if needed
          if (campaignPayments && campaignPayments.length > 0) {
            const idsToFetch = Array.from(paymentIds).filter(id => 
              !directPayments || !directPayments.some(p => p.id === id)
            );
            
            if (idsToFetch.length > 0) {
              const { data: paymentData, error: paymentsError } = await supabase
                .from('stripe_payments')
                .select('id, amount, status')
                .in('id', idsToFetch);
                
              if (paymentsError) {
                console.error("Error fetching payment details:", paymentsError);
              } else if (paymentData && paymentData.length > 0) {
                for (const payment of paymentData) {
                  if (payment.amount && typeof payment.amount === 'number') {
                    if (payment.status === 'completed') {
                      completedAmount += payment.amount;
                    } else if (payment.status === 'pending') {
                      pendingAmount += payment.amount;
                    }
                  }
                }
              }
            }
          }
          
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
