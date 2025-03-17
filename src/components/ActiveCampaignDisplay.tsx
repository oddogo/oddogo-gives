
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
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('campaigns')
          .select('*, campaign_payments(payment_id, stripe_payments:payment_id(amount))')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Error loading campaign:", error);
          return;
        }
        
        if (data) {
          setCampaign(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadCampaign();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center px-4 sm:px-0 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-full mb-4 mx-auto"></div>
        <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 mx-auto"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2 mx-auto"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2 mx-auto"></div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  // Calculate progress
  const percentProgress = Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100);
  
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
    <div className="max-w-2xl mx-auto px-4 sm:px-0 mb-12 bg-white rounded-lg shadow-sm p-6">
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
            <span className="font-medium">{formatCurrency(campaign.current_amount)}</span>
            <span className="text-gray-500">of {formatCurrency(campaign.target_amount)} goal</span>
          </div>
        </div>
        
        {campaign.end_date && (
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Ends {formatDate(campaign.end_date)}</span>
          </div>
        )}
        
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
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
  );
};
