import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { ChartLegend } from "@/components/ChartLegend";
import { Logo } from "@/components/Logo";
import { Share2, MapPin } from "lucide-react";
import { Avatar } from "@/components/Avatar";
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
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-white">
      <div className="text-gray-600">Profile not found or not public</div>
    </div>
  );

  const chartData = allocations.map(allocation => ({
    name: allocation.allocation_name,
    value: allocation.allocation_percentage * 100,
    type: allocation.allocation_type
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#008080] text-white py-4">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-12">
            <Avatar uid={id || ''} size="lg" />
            <h1 className="text-3xl font-medium mt-4 text-gray-900">{profile.display_name}</h1>
            {profile.location && (
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.bio && (
              <p className="mt-4 text-gray-600 text-center max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Fingerprint Section */}
          {allocations.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-medium mb-6 text-gray-900">Charitable Fingerprint™</h2>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="aspect-square relative">
                  <DashboardChart data={allocations} />
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <ChartLegend data={chartData} />
                </div>
              </div>
              
              {profile.causes_description && (
                <div className="mt-8 text-gray-600">
                  <h3 className="font-medium text-gray-900 mb-2">About My Causes</h3>
                  <p>{profile.causes_description}</p>
                </div>
              )}
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            <div className="bg-[#008080] p-8 rounded-xl relative">
              <QRCodeSVG
                value={window.location.href}
                size={200}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "/lovable-uploads/b7702484-a438-4044-b5ef-cc6fbc31513f.png",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
                bgColor="#008080"
                fgColor="#FFFFFF"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <div className="bg-white text-gray-600 px-4 py-1 rounded-full shadow-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
