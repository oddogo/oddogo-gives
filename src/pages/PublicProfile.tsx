import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
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
      console.log('Loading profile for user ID:', id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        console.log('No profile found for ID:', id);
        setLoading(false);
        return;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);

      // First, get the fingerprint user ID
      const { data: fingerprintUser, error: fingerprintUserError } = await supabase
        .from('fingerprints_users')
        .select('id')
        .eq('user_id', id)
        .single();

      if (fingerprintUserError) {
        console.log('Error fetching fingerprint user:', fingerprintUserError);
      }

      if (fingerprintUser) {
        // Now use the numeric ID for the allocations query
        const { data: allocationsData, error: allocationsError } = await supabase
          .from('fingerprints_allocations')
          .select(`
            id,
            allocation_percentage,
            allocation_charity_id,
            charities_charities (
              charity_name
            )
          `)
          .eq('fingerprints_users_id', fingerprintUser.id);

        console.log('Raw allocations data:', allocationsData);
        console.log('Allocations error:', allocationsError);

        if (allocationsData && allocationsData.length > 0) {
          const formattedAllocations: Allocation[] = allocationsData.map(item => ({
            id: Number(item.id),
            allocation_name: item.charities_charities?.charity_name || 'Unknown',
            allocation_type: 'Charity',
            allocation_percentage: Number(item.allocation_percentage),
            cause_name: item.charities_charities?.charity_name || 'Unknown'
          }));
          
          console.log('Formatted allocations from direct query:', formattedAllocations);
          setAllocations(formattedAllocations);
          return;
        }
      }

      // Fallback to v_fingerprints_live view if no direct allocations found
      console.log('No direct allocations found, trying v_fingerprints_live view');
      
      const { data: fingerprintData, error: fingerprintError } = await supabase
        .from('v_fingerprints_live')
        .select('*')
        .eq('user_id', id);

      console.log('View fingerprint data:', fingerprintData);
      console.log('View error:', fingerprintError);
      
      if (fingerprintError) throw fingerprintError;
      
      if (fingerprintData && fingerprintData.length > 0) {
        const formattedAllocations: Allocation[] = fingerprintData.map(item => ({
          id: Number(item.id),
          allocation_name: item.allocation_name || 'Unknown',
          allocation_type: (item.allocation_type || 'Unknown') as AllocationType,
          allocation_percentage: Number(item.allocation_percentage),
          cause_name: item.allocation_name || 'Unknown'
        }));
        
        console.log('Formatted allocations from view:', formattedAllocations);
        setAllocations(formattedAllocations);
      }
    } catch (error) {
      console.error('Error loading public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600">Profile not found or not public</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="mb-8">
            <Logo className="text-[#008080]" />
          </div>
          <div className="mb-4">
            <Avatar uid={id || ''} size="lg" url={profile?.avatar_url} />
          </div>
          <div className="inline-flex bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm items-center gap-2 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{profile.location || "London, UK"}</span>
          </div>
          <h1 className="text-2xl font-semibold mb-4 text-black">{profile.display_name}</h1>
          <p className="text-gray-600 max-w-2xl mb-12 px-4 sm:px-6 text-lg leading-relaxed">
            {profile.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
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
          <div className="mb-12 w-full px-4 sm:px-0">
            <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
              <div className="w-full md:col-span-4">
                <div className="aspect-square relative w-full bg-white/5 rounded-lg backdrop-blur-sm p-4 border border-gray-200/10">
                  <DashboardChart 
                    data={allocations} 
                    hoveredIndex={hoveredIndex}
                    onHoverChange={setHoveredIndex}
                  />
                </div>
              </div>
              <div className="w-full md:col-span-8">
                <div className="bg-white/5 rounded-lg backdrop-blur-sm border border-gray-200/10">
                  <AllocationTable 
                    data={allocations} 
                    hoveredIndex={hoveredIndex}
                    onHoverChange={setHoveredIndex}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center px-4 sm:px-0">
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
  );
};

export default PublicProfile;
