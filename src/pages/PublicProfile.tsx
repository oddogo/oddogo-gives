import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { ChartLegend } from "@/components/ChartLegend";
import { Logo } from "@/components/Logo";
import { MapPin, Trophy, Coins, Flag, Zap } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Allocation, AllocationType } from "@/types/allocation";
import { AllocationTable } from "@/components/AllocationTable";

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#008080]">
      <div className="animate-pulse text-black">Loading...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-[#008080]">
      <div className="text-black">Profile not found or not public</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#008080]">
      <div className="min-h-screen mx-auto max-w-6xl">
        <div className="py-8">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/84d2bfc5-f954-419b-bc27-5208fd6f2676.png" 
              alt="Oddogo Logo" 
              className="h-12"
            />
          </div>
        </div>

        <div className="bg-white min-h-screen rounded-xl shadow-lg">
          <div className="p-8">
            <div className="flex flex-col items-center mb-12 text-center">
              <div className="mb-4">
                <Avatar uid={id || ''} size="lg" url={profile?.avatar_url} />
              </div>
              <div className="inline-flex bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{profile.location || "London, UK"}</span>
              </div>
              <h1 className="text-2xl font-semibold mb-4 text-black">{profile.display_name}</h1>
              <p className="text-gray-600 max-w-2xl mb-12 px-6 text-lg leading-relaxed">
                {profile.bio}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Trophy size={14} />
                  <span>Silver Supporter</span>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Trophy size={14} />
                  <span>Rank #24</span>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Coins size={14} />
                  <span>18 Donations</span>
                </div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Flag size={14} />
                  <span>3 Successful Campaigns</span>
                </div>
              </div>

              <button className="bg-[#008080] text-white px-5 py-2 rounded-full flex items-center gap-2 text-sm">
                <img 
                  src="/lovable-uploads/16dff745-56b1-4162-b2c6-2f3ca2eb1b09.png" 
                  alt="Fingerprint" 
                  className="w-4 h-4 brightness-0 invert"
                />
                <span>Giving Fingerprint</span>
              </button>
            </div>

            {allocations.length > 0 && (
              <div className="mb-12">
                <div className="grid md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-4">
                    <div className="aspect-square relative w-full">
                      <DashboardChart 
                        data={allocations} 
                        hoveredIndex={hoveredIndex}
                        onHoverChange={setHoveredIndex}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-8">
                    <AllocationTable 
                      data={allocations} 
                      hoveredIndex={hoveredIndex}
                      onHoverChange={setHoveredIndex}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span>Active Campaign</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-black">Marathon Fundraiser</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                I'm running my first marathon to support causes that are close to my heart.
                Every mile I run will help fund my Giving Fingerprint and support these amazing organizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
