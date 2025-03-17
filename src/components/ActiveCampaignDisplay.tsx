
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Zap, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ActiveCampaignDisplayProps {
  userId: string;
}

export const ActiveCampaignDisplay = ({ userId }: ActiveCampaignDisplayProps) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the active campaign with payment data
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            campaign_payments(
              payment_id,
              stripe_payments:payment_id(amount)
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
          console.error("Error loading campaign:", error);
          setLoading(false);
          return;
        }
        
        if (data) {
          // Calculate the current amount from the linked payments
          let currentAmount = 0;
          if (data.campaign_payments && data.campaign_payments.length > 0) {
            data.campaign_payments.forEach((payment: any) => {
              if (payment.stripe_payments && payment.stripe_payments.amount) {
                currentAmount += Number(payment.stripe_payments.amount);
              }
            });
          }
          
          setCampaign({
            ...data,
            current_amount: data.current_amount || currentAmount || 0
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCampaign();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-0 mb-12">
        <div className="animate-pulse bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-40 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto"></div>
          <div className="h-2 w-full bg-gray-200 rounded"></div>
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="h-20 w-full bg-gray-200 rounded"></div>
          <div className="flex justify-center">
            <div className="h-10 w-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  // Calculate progress
  const targetAmount = campaign.target_amount || 0;
  const currentAmount = campaign.current_amount || 0;
  const percentProgress = targetAmount > 0 
    ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
    : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  // Format end date if it exists
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0 mb-12">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mb-4">
            <Zap className="w-4 h-4" />
            <span>Active Campaign</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-black">{campaign.title}</h3>
          
          <div className="mb-6">
            <Progress 
              value={percentProgress} 
              className="h-2 bg-gray-200"
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="font-medium">{formatCurrency(currentAmount)}</span>
              <span className="text-gray-500">of {formatCurrency(targetAmount)} goal</span>
            </div>
          </div>
          
          {campaign.end_date && (
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Ends {formatDate(campaign.end_date)}</span>
            </div>
          )}
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-6 line-clamp-3">
            {campaign.description}
          </p>
          
          <Link to={`/campaigns/${campaign.slug}`}>
            <Button className="gap-2">
              Support this Campaign
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
