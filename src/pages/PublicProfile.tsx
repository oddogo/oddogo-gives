import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";
import { Allocation, AllocationType } from "@/types/allocation";

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
      // Load profile
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

      // Load fingerprint data
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
        cause_name: item.allocation_name // Using allocation_name as fallback since it's the human-readable name
      }));
      
      setAllocations(formattedAllocations);
    } catch (error) {
      console.error('Error loading public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#008080] text-white flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-[#008080] text-white flex items-center justify-center">Profile not found or not public</div>;

  return (
    <div className="min-h-screen bg-[#008080] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">{profile.display_name}'s Charitable Fingerprint™</h1>
            {profile.bio && <p className="mb-4">{profile.bio}</p>}
            {profile.causes_description && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Important Causes</h2>
                <p>{profile.causes_description}</p>
              </div>
            )}
          </div>

          {allocations.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Allocation Overview</h2>
              <div className="mb-8">
                <DashboardChart data={allocations} />
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <AllocationTable data={allocations} />
              </div>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Share This Profile</h2>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={currentUrl}
                size={200}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/lovable-uploads/73c9c40f-6400-4389-aec9-42268145ca00.png",
                  height: 24,
                  width: 24,
                  excavate: true,
                  x: undefined,
                  y: undefined,
                }}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
