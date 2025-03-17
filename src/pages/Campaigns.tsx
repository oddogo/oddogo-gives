
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { CampaignStatistic } from "@/types/campaign";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CampaignsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignStatistic[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      await loadCampaigns(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('v_campaign_statistics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add required properties and handle type casting
      const typedData = data?.map(item => ({
        ...item,
        is_featured: false, // Default value since it's missing from the view
        status: (item.status as "active" | "completed" | "cancelled") || "active"
      })) as CampaignStatistic[] || [];
      
      setCampaigns(typedData);
    } catch (error: any) {
      console.error('Error loading campaigns:', error.message);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleCreateCampaign = () => {
    navigate("/campaigns/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="flex">
        <DashboardSidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 p-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Your Campaigns</h1>
              <Button 
                onClick={handleCreateCampaign}
                className="gap-2"
              >
                <Plus size={16} />
                Create Campaign
              </Button>
            </div>
            <p className="text-gray-400 mt-2">
              Manage your fundraising campaigns and track their progress
            </p>
          </header>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16 bg-black/20 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-3">No Campaigns Yet</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You haven't created any fundraising campaigns yet. Start your first campaign to begin raising funds for your causes.
              </p>
              <Button onClick={handleCreateCampaign}>Create Your First Campaign</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="h-full"
                  onClick={() => navigate(`/campaigns/${campaign.slug}`)}
                >
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
