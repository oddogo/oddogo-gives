
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Campaign } from '@/types/campaign';

interface UseCampaignProps {
  slug?: string;
  id?: string;
}

interface UseCampaignResult {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refreshCampaign: () => Promise<void>;
  donations: any[];
  totalDonated: number;
  donorCount: number;
}

export function useCampaign({ slug, id }: UseCampaignProps): UseCampaignResult {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [totalDonated, setTotalDonated] = useState<number>(0);
  const [donorCount, setDonorCount] = useState<number>(0);

  const fetchCampaign = async () => {
    if (!slug && !id) return;

    setLoading(true);
    setError(null);
    
    try {
      const query = supabase
        .from('campaigns')
        .select('*, profiles(display_name, avatar_url)')
        .single();
        
      // Filter by either slug or id
      if (slug) {
        query.eq('slug', slug);
      } else if (id) {
        query.eq('id', id);
      }
      
      const { data, error: campaignError } = await query;
      
      if (campaignError) {
        setError('Failed to load campaign');
        console.error('Error fetching campaign:', campaignError);
        return;
      }
      
      if (!data) {
        setError('Campaign not found');
        return;
      }
      
      // Fetch the donations linked to this campaign
      const { data: paymentData, error: paymentError } = await supabase
        .from('campaign_payments')
        .select(`
          *,
          stripe_payments:payment_id(
            id,
            amount,
            created_at,
            stripe_payment_email,
            status
          )
        `)
        .eq('campaign_id', data.id);
      
      if (paymentError) {
        console.error('Error fetching payment data:', paymentError);
      }
      
      // Process payment data
      const validPayments = paymentData
        ? paymentData
            .filter((p) => p.stripe_payments && p.stripe_payments.status === 'succeeded')
            .map((p) => p.stripe_payments)
        : [];
      
      // Calculate totals
      const total = validPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      
      // Set the unique donor count based on email
      const uniqueDonors = new Set(validPayments.map((p) => p.stripe_payment_email));
            
      setCampaign(data);
      setDonations(validPayments);
      setTotalDonated(total);
      setDonorCount(uniqueDonors.size);
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [slug, id]);

  const refreshCampaign = async () => {
    await fetchCampaign();
    toast.success('Campaign data refreshed');
  };

  return {
    campaign,
    loading,
    error,
    refreshCampaign,
    donations,
    totalDonated,
    donorCount
  };
}
