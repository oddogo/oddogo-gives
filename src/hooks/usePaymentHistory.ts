
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment, CampaignPaymentGroup } from "@/types/payment";
import { organizePaymentsByCampaign, calculateTotals } from "@/utils/paymentUtils";

export const usePaymentHistory = (userId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [campaignPayments, setCampaignPayments] = useState<CampaignPaymentGroup>({});
  const [standalonePayments, setStandalonePayments] = useState<Payment[]>([]);
  const [userFingerprint, setUserFingerprint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFingerprint = async () => {
    try {
      const { data, error } = await supabase
        .from('fingerprints_users')
        .select('fingerprint_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching fingerprint:', error);
        return null;
      }
      
      console.log('Fetched fingerprint for user:', data?.fingerprint_id);
      setUserFingerprint(data?.fingerprint_id || null);
      return data?.fingerprint_id;
    } catch (error) {
      console.error('Error in fetchFingerprint:', error);
      return null;
    }
  };

  const fetchPayments = async (fingerprintId: string | null) => {
    try {
      setLoading(true);
      
      if (!fingerprintId) {
        console.log('No fingerprint ID available, cannot fetch payments');
        setLoading(false);
        return;
      }
      
      console.log('Fetching payments for fingerprint ID:', fingerprintId);
      
      // Use v_stripe_payments view which has the necessary related data
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('v_stripe_payments')
        .select('*')
        .eq('fingerprint_id', fingerprintId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments by fingerprint:', paymentsError);
        toast.error('Failed to load payment history');
        setLoading(false);
        return;
      }

      console.log('Fetched payments data:', paymentsData);

      // Get campaign info for payments
      const paymentIds = paymentsData?.map(p => p.id) || [];
      
      if (paymentIds.length > 0) {
        const { data: campaignPaymentsData, error: campaignError } = await supabase
          .from('campaign_payments')
          .select(`
            campaign_id,
            payment_id,
            campaigns (
              id,
              title,
              slug
            )
          `)
          .in('payment_id', paymentIds);

        if (campaignError) {
          console.error('Error fetching campaign payment associations:', campaignError);
        } else {
          console.log('Campaign payments data:', campaignPaymentsData);
          
          // Create a map of payment IDs to campaign info
          const campaignMap: Record<string, { id: string, title: string, slug: string }> = {};
          campaignPaymentsData?.forEach(cp => {
            if (cp.campaigns) {
              campaignMap[cp.payment_id] = {
                id: cp.campaign_id,
                title: cp.campaigns.title,
                slug: cp.campaigns.slug
              };
            }
          });

          // Enhance payment data with campaign info
          const enhancedPayments = paymentsData?.map(payment => {
            const campaignInfo = campaignMap[payment.id];
            
            // Create a proper Payment object with all fields
            const enhancedPayment: Payment = {
              ...payment,
              campaign_id: campaignInfo?.id || payment.campaign_id || undefined,
              campaign_title: campaignInfo?.title || '',
              campaign_slug: campaignInfo?.slug || ''
            };
            
            return enhancedPayment;
          }) || [];

          console.log('Enhanced payments with campaign data:', enhancedPayments);
          setPayments(enhancedPayments);

          // Calculate amounts
          const { completed, pending } = calculateTotals(enhancedPayments);
          setTotalReceived(completed);
          setPendingAmount(pending);

          // Organize payments by campaign
          const { campaignPayments: byCampaign, standalonePayments: standalone } = 
            organizePaymentsByCampaign(enhancedPayments);

          setCampaignPayments(byCampaign);
          setStandalonePayments(standalone);
        }
      } else {
        // If no payments, set empty arrays
        setPayments([]);
        setCampaignPayments({});
        setStandalonePayments([]);
        setTotalReceived(0);
        setPendingAmount(0);
      }
    } catch (error) {
      console.error('Error in fetchPayments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (userId) {
        const fingerprintId = await fetchFingerprint();
        if (fingerprintId) {
          fetchPayments(fingerprintId);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    init();

    // Setup subscription for real-time updates
    if (userId) {
      const channel = supabase
        .channel('stripe_payments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stripe_payments'
          },
          async () => {
            const fingerprintId = await fetchFingerprint();
            if (fingerprintId) {
              fetchPayments(fingerprintId);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  return {
    payments,
    totalReceived,
    pendingAmount,
    campaignPayments,
    standalonePayments,
    loading
  };
};
