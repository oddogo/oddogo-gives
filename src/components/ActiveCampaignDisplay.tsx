
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Calendar, CheckCircle, Clock } from "lucide-react";
import { CampaignProgressChart } from "./campaigns/CampaignProgressChart";

interface ActiveCampaignDisplayProps {
  userId: string;
}

export const ActiveCampaignDisplay = ({ userId }: ActiveCampaignDisplayProps) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        
        console.log("Loading active campaign for user:", userId);
        
        // Get the active campaign for this user
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (campaignError) {
          if (campaignError.code !== 'PGRST116') { // Not found error
            console.error("Error loading campaign:", campaignError);
          } else {
            console.log("No active campaign found for user:", userId);
          }
          setLoading(false);
          return;
        }
        
        console.log("Found active campaign:", campaignData);
        setCampaign(campaignData);
        
        // Get all payments associated with this campaign
        const { data: campaignPayments, error: paymentsError } = await supabase
          .from('campaign_payments')
          .select('payment_id')
          .eq('campaign_id', campaignData.id);
          
        if (paymentsError) {
          console.error("Error fetching campaign payments:", paymentsError);
          setLoading(false);
          return;
        }
        
        console.log("Campaign payment associations:", campaignPayments);
        
        if (campaignPayments.length === 0) {
          console.log("No payments associated with this campaign yet");
          setLoading(false);
          return;
        }
        
        // Get the details of those payments
        const paymentIds = campaignPayments.map(p => p.payment_id);
        
        const { data: payments, error: paymentDetailsError } = await supabase
          .from('stripe_payments')
          .select('id, amount, status')
          .in('id', paymentIds);
          
        if (paymentDetailsError) {
          console.error("Error fetching payment details:", paymentDetailsError);
          setLoading(false);
          return;
        }
        
        console.log("Campaign payments details:", payments);
        
        // Calculate completed and pending amounts
        let completed = 0;
        let pending = 0;
        
        payments.forEach((payment: any) => {
          if (payment.status === 'completed') {
            completed += payment.amount;
          } else if (payment.status === 'pending') {
            pending += payment.amount;
          }
        });
        
        console.log("Campaign payment amounts:", { completed, pending });
        setCompletedAmount(completed);
        setPendingAmount(pending);
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
    <div className="w-full py-12 bg-gray-50" id="campaign">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-medium">Active Campaign</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {campaign.title}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {campaign.image_url && (
              <div className="md:w-1/3">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={campaign.image_url} 
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className={campaign.image_url ? "md:w-2/3" : "w-full"}>
              <p className="text-gray-600 mb-6 text-lg">
                {campaign.description}
              </p>
              
              <div className="space-y-4 mb-6">
                <CampaignProgressChart 
                  targetAmount={campaign.target_amount} 
                  completedAmount={completedAmount}
                  pendingAmount={pendingAmount}
                  showDetails={true}
                />
                  
                {campaign.end_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Ends {formatDate(campaign.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
