
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { User } from "@supabase/supabase-js";
import { CampaignStatistic } from "@/types/campaign";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, Users, CalendarIcon, ArrowLeft, Loader2, PiggyBank } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from "date-fns";
import { PaymentAssignment } from "@/components/campaigns/PaymentAssignment";

const CampaignDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignStatistic | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
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
      await loadCampaign();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate("/auth");
    }
  };
  
  const loadCampaign = async () => {
    try {
      setLoading(true);
      
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('v_campaign_statistics')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Campaign not found",
          description: "The campaign you're looking for doesn't exist or has been removed.",
          variant: "destructive",
        });
        navigate('/campaigns');
        return;
      }
      
      // Type assertion with proper property handling
      const typedCampaign = {
        ...data,
        is_featured: Boolean(data.is_featured),
        status: (data.status as "active" | "completed" | "cancelled") || "active"
      } as CampaignStatistic;
      
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
  
  const handleEditCampaign = () => {
    if (campaign) {
      navigate(`/campaigns/edit/${campaign.slug}`);
    }
  };
  
  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    
    try {
      // First delete all campaign_payments associations
      const { error: paymentsError } = await supabase
        .from('campaign_payments')
        .delete()
        .eq('campaign_id', campaign.id);
      
      if (paymentsError) throw paymentsError;
      
      // Then delete the campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);
      
      if (error) throw error;
      
      toast({
        title: "Campaign deleted",
        description: "Your campaign has been successfully deleted",
      });
      navigate('/campaigns');
    } catch (error: any) {
      console.error('Error deleting campaign:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setConfirmDelete(false);
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
  
  const percentProgress = campaign 
    ? Math.min(Math.round((campaign.current_amount / campaign.target_amount) * 100), 100)
    : 0;
  const formattedTarget = campaign ? `£${(campaign.target_amount / 100).toFixed(2)}` : "£0.00";
  const formattedCurrent = campaign ? `£${(campaign.current_amount / 100).toFixed(2)}` : "£0.00";
  
  const isOwner = user && campaign && user.id === campaign.user_id;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
        <div className="flex">
          <DashboardSidebar user={user} onSignOut={handleSignOut} />
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return null;
  }
  
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {campaign.image_url && (
                <div className="rounded-lg overflow-hidden border border-white/10 h-64">
                  <img 
                    src={campaign.image_url} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-4 bg-black/20 rounded-lg p-6 border border-white/10">
                <h1 className="text-3xl font-bold">{campaign.title}</h1>
                
                <div className="flex items-center space-x-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon size={14} />
                    Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {campaign.donation_count || 0} donations
                  </span>
                  
                  {campaign.end_date && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      Ends {format(new Date(campaign.end_date), 'PPP')}
                    </span>
                  )}
                </div>
                
                <p className="text-slate-300">{campaign.description}</p>
                
                {isOwner && (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditCampaign}
                      className="gap-2"
                    >
                      <Edit size={14} />
                      Edit Campaign
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-400/30 gap-2"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 size={14} />
                      Delete Campaign
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 bg-black/20 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-slate-300 whitespace-pre-line">{campaign.description}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/20 rounded-lg p-6 border border-white/10 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Fundraising Progress
                </h2>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Progress</span>
                    <span className="font-medium text-white">{percentProgress}%</span>
                  </div>
                  
                  <Progress 
                    value={percentProgress} 
                    className="h-2 bg-slate-700"
                  />
                  
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white font-medium">{formattedCurrent}</span>
                    <span className="text-slate-400">of {formattedTarget} goal</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/10 mt-4">
                  <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                    <span>Donations:</span>
                    <span>{campaign.donation_count || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      campaign.status === 'completed' 
                        ? 'text-green-400' 
                        : campaign.status === 'cancelled' 
                        ? 'text-red-400' 
                        : 'text-blue-400'
                    }`}>
                      {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <h2 className="text-xl font-semibold mb-4">Campaign Management</h2>
                  <PaymentAssignment 
                    campaign={campaign} 
                    onAssignmentChange={loadCampaign}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign "{campaign?.title}" and remove all payment assignments. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCampaign}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDetail;
