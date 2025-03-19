
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Payment, CampaignPaymentGroup } from "@/types/payment";
import { organizePaymentsByCampaign } from "@/utils/paymentUtils";

export const usePaymentHistory = (userId: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [campaignPayments, setCampaignPayments] = useState<CampaignPaymentGroup>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        
        if (!userId) {
          console.log('No user ID provided, cannot fetch payments');
          setLoading(false);
          return;
        }
        
        console.log('Fetching payments for user ID:', userId);
        
        // Directly query the stripe_payments table using the user_id
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('stripe_payments')
          .select('*, campaigns(title, slug)')
          .or(`user_id.eq.${userId},campaign_id.in.(select id from campaigns where user_id.eq.${userId})`)
          .order('created_at', { ascending: false });

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
          toast.error('Failed to load payment history');
          setLoading(false);
          return;
        }

        console.log('Fetched payments data:', paymentsData);
        
        // Process and enhance payment data
        const enhancedPayments = paymentsData?.map(payment => {
          const enhancedPayment: Payment = {
            ...payment,
            campaign_title: payment.campaigns?.title || '',
            campaign_slug: payment.campaigns?.slug || ''
          };
          
          return enhancedPayment;
        }) || [];

        console.log('Enhanced payments with campaign data:', enhancedPayments);
        setPayments(enhancedPayments);

        // Calculate totals for completed and pending payments
        const completed = enhancedPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) || 0;
        
        const pending = enhancedPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0) || 0;
        
        setTotalReceived(completed);
        setPendingAmount(pending);

        // Organize payments by campaign
        const { campaignPayments: byCampaign } = organizePaymentsByCampaign(enhancedPayments);

        console.log('Organized campaign payments:', byCampaign);
        setCampaignPayments(byCampaign);
      } catch (error) {
        console.error('Error in fetchPayments:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();

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
          () => {
            fetchPayments();
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
    loading
  };
};
