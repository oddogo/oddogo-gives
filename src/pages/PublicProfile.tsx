
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { ChartLegend } from "@/components/ChartLegend";
import { Logo } from "@/components/Logo";
import { MapPin, Trophy, Coins, Flag, Zap } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Allocation, AllocationType } from "@/types/allocation";

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

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
      {/* Header Logo */}
      <div className="py-6 border-b">
        <div className="container mx-auto px-4">
          <Logo />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="relative mb-4">
              <Avatar uid={id || ''} size="lg" url={profile.avatar_url} />
              <div className="absolute -bottom-2 -right-2 bg-[#008080] rounded-full p-2">
                <img 
                  src="/lovable-uploads/16dff745-56b1-4162-b2c6-2f3ca2eb1b09.png" 
                  alt="Verified" 
                  className="w-4 h-4"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{profile.location || "London, UK"}</span>
            </div>
            <h1 className="text-3xl font-semibold mb-4">{profile.display_name}</h1>
            <p className="text-gray-600 max-w-2xl mb-8">
              {profile.bio}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full flex items-center gap-2">
                <Trophy size={16} />
                <span>Silver Supporter</span>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2">
                <Trophy size={16} />
                <span>Rank #24</span>
              </div>
              <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full flex items-center gap-2">
                <Coins size={16} />
                <span>18 Donations</span>
              </div>
              <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full flex items-center gap-2">
                <Flag size={16} />
                <span>3 Successful Campaigns</span>
              </div>
            </div>

            <button className="bg-[#008080] text-white px-6 py-2 rounded-full flex items-center gap-2">
              <img 
                src="/lovable-uploads/16dff745-56b1-4162-b2c6-2f3ca2eb1b09.png" 
                alt="Fingerprint" 
                className="w-5 h-5"
              />
              <span>Giving Fingerprint</span>
            </button>
          </div>

          {/* Fingerprint Section */}
          {allocations.length > 0 && (
            <div className="bg-white rounded-xl p-8 mb-12">
              <h2 className="text-2xl font-semibold mb-6">Donation Distribution</h2>
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="aspect-square relative">
                  <DashboardChart data={allocations} />
                </div>
                <div className="space-y-4">
                  <ChartLegend data={chartData} />
                </div>
              </div>
            </div>
          )}

          {/* Active Campaign Section */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span>Active Campaign</span>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Marathon Fundraiser</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I'm running my first marathon to support causes that are close to my heart.
              Every mile I run will help fund my Giving Fingerprint and support these amazing organizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
