import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";
import { Allocation, AllocationType } from "@/types/allocation";
import { Logo } from "@/components/Logo";
import { Share2, Globe } from "lucide-react";

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUrl = window.location.href;

  useEffect(() => {
    loadPublicProfile();
  }, [id]);

  const loadPublicProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profileData || !profileData.is_published) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: fingerprintData, error: fingerprintError } = await supabase
        .from('v_fingerprints_live')
        .select('*')
        .eq('user_id', id);

      if (fingerprintError) throw fingerprintError;
      
      const formattedAllocations: Allocation[] = (fingerprintData || []).map(item => ({
        id: Number(item.id),
        allocation_name: item.allocation_name,
        allocation_type: item.allocation_type as AllocationType,
        allocation_percentage: Number(item.allocation_percentage),
        cause_name: item.allocation_name
      }));
      
      setAllocations(formattedAllocations);
    } catch (error) {
      console.error('Error loading public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#9b87f5] to-[#D946EF] text-white flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-[#9b87f5] to-[#D946EF] text-white flex items-center justify-center">
      Profile not found or not public
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9b87f5] to-[#D946EF] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-morphism rounded-2xl p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">{profile.display_name}'s</h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Globe className="w-5 h-5" />
              <span className="font-medium">Charitable Fingerprint™</span>
            </div>
            
            {profile.bio && (
              <p className="mt-6 text-lg text-white/90 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {profile.causes_description && (
            <div className="glass-morphism rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-gradient">Important Causes</span>
              </h2>
              <p className="text-white/90 leading-relaxed">
                {profile.causes_description}
              </p>
            </div>
          )}

          {allocations.length > 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-morphism rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gradient">Impact Distribution</h2>
                <DashboardChart data={allocations} />
              </div>

              <div className="glass-morphism rounded-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gradient">Allocation Details</h2>
                <div className="bg-white/5 rounded-xl overflow-hidden">
                  <AllocationTable data={allocations} />
                </div>
              </div>
            </div>
          )}

          <div className="glass-morphism rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Share2 className="w-5 h-5" />
              <h2 className="text-2xl font-semibold text-gradient">Share Profile</h2>
            </div>
            <div className="bg-white inline-block p-4 rounded-xl">
              <QRCodeSVG
                value={currentUrl}
                size={180}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/lovable-uploads/b7702484-a438-4044-b5ef-cc6fbc31513f.png",
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <div className="flex justify-center py-8 opacity-80 hover:opacity-100 transition-opacity">
            <Logo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
