
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { User } from "@supabase/supabase-js";
import { Campaign } from "@/types/campaign";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CampaignFormPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(slug);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  
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
      
      if (isEditMode && slug) {
        await loadCampaign(slug);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate("/auth");
    }
  };
  
  const loadCampaign = async (campaignSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', campaignSlug)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Campaign not found",
          description: "The campaign you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate('/campaigns');
        return;
      }
      
      // Check if the user is the owner of the campaign
      if (data.user_id !== user?.id) {
        toast({
          title: "Access denied",
          description: "You don't have permission to edit this campaign.",
          variant: "destructive",
        });
        navigate('/campaigns');
        return;
      }
      
      // Ensure the status is correctly typed
      const typedCampaign: Campaign = {
        ...data,
        status: data.status as "active" | "completed" | "cancelled"
      };
      
      setCampaign(typedCampaign);
    } catch (error: any) {
      console.error('Error loading campaign:', error.message);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="flex">
        <DashboardSidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 p-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/campaigns')} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              {isEditMode ? "Edit Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-gray-400 mb-6">
              {isEditMode 
                ? "Update your campaign's details and settings" 
                : "Create a new fundraising campaign for your causes"}
            </p>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              </div>
            ) : (
              <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                <CampaignForm 
                  campaign={campaign || undefined} 
                  onSuccess={() => {
                    if (isEditMode) {
                      navigate(`/campaigns/${slug}`);
                    } else {
                      navigate('/campaigns');
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignFormPage;
