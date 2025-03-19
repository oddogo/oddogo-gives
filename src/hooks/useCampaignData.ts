
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
        
        // For public profiles, use a direct approach to get total payments from the stripe_payments table
        // This avoids potential RLS issues with the campaign_payments junction table
        if (campaignData.id) {
          const campaignId = campaignData.id;
          
          console.log(`Attempting direct query for payments with campaign_id: ${campaignId}`);
          
          // First, try a direct query to stripe_payments table
          const { data: directPayments, error: directError } = await supabase
            .from('stripe_payments')
            .select('id, amount, status')
            .eq('campaign_id', campaignId);
            
          // If we get direct payment data, use it
          if (!directError && directPayments && directPayments.length > 0) {
            console.log(`Found ${directPayments.length} payments directly linked to campaign ${campaignId}`);
            
            let completedAmount = 0;
            let pendingAmount = 0;
            
            for (const payment of directPayments) {
              if (payment.amount && typeof payment.amount === 'number') {
                if (payment.status === 'completed') {
                  completedAmount += payment.amount;
                } else if (payment.status === 'pending' || payment.status === 'processing') {
                  pendingAmount += payment.amount;
                }
              }
            }
            
            setTotalAmount(completedAmount);
            setPendingAmount(pendingAmount);
          } else {
            // Fallback to the junction table approach
            console.log(`No direct payments found, trying campaign_payments junction table for campaign: ${campaignId}`);
            
            // Get the campaign's total amount from its current_amount field (which is updated by triggers)
            const completedAmount = campaignData.current_amount || 0;
            setTotalAmount(completedAmount);
            
            // Query the campaign_payments table to get payment IDs
            const { data: campaignPaymentsData, error: cpError } = await supabase
              .from('campaign_payments')
              .select('payment_id')
              .eq('campaign_id', campaignId);
              
            if (cpError) {
              console.error("Error fetching campaign payment IDs:", cpError);
              setLoading(false);
              return;
            }
            
            if (!campaignPaymentsData || campaignPaymentsData.length === 0) {
              console.log("No payments found for campaign:", campaignId);
              setPendingAmount(0);
              setLoading(false);
              return;
            }
            
            // Extract the payment IDs
            const paymentIds = campaignPaymentsData.map(cp => cp.payment_id);
            console.log(`Found ${paymentIds.length} payments linked to campaign ${campaignId} through junction table:`, paymentIds);
            
            // Now fetch pending payments only
            const { data: pendingPayments, error: pendingError } = await supabase
              .from('stripe_payments')
              .select('id, amount, status')
              .in('id', paymentIds)
              .in('status', ['pending', 'processing']);
              
            if (!pendingError && pendingPayments && pendingPayments.length > 0) {
              const calculatedPendingAmount = pendingPayments.reduce((sum, payment) => 
                sum + (payment.amount && typeof payment.amount === 'number' ? payment.amount : 0), 0);
              
              setPendingAmount(calculatedPendingAmount);
              console.log(`Campaign ${campaignId} pending amount:`, calculatedPendingAmount);
            } else {
              setPendingAmount(0);
            }
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
