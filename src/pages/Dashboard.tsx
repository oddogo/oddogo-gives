import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { AllocationTable } from "@/components/AllocationTable";
import { Allocation, AllocationType } from "@/types/allocation";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
      console.log('Current authenticated user ID:', user.id);
      setUserId(user.id);
      await loadFingerprints(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadFingerprints = async (userId: string) => {
    try {
      console.log('Fetching fingerprints for user:', userId);
      
      const { data, error } = await supabase
        .from('v_fingerprints_live')
        .select('*')
        .eq('user_id', userId);

      console.log('Raw response:', { data, error });

      if (error) throw error;

      if (data) {
        const formattedAllocations: Allocation[] = data.map(item => ({
          id: Number(item.id),
          allocation_name: item.allocation_name,
          allocation_type: item.allocation_type as AllocationType,
          allocation_percentage: Number(item.allocation_percentage),
          cause_name: item.allocation_name // Using allocation_name as fallback since it's the human-readable name
        }));
        setAllocations(formattedAllocations);
        console.log('Processed data:', formattedAllocations);
      }
    } catch (error: any) {
      console.error('Error loading fingerprints:', error.message);
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

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#008080] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Logo />
          <div className="space-x-4">
            <Button onClick={() => navigate("/profile")} variant="outline">
              Profile
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Charitable Fingerprint™</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <p className="text-sm">Current User ID: {userId}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Allocation Overview</h2>
            {allocations.length > 0 ? (
              <>
                <div className="mb-8">
                  <DashboardChart data={allocations} />
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <AllocationTable data={allocations} />
                </div>
              </>
            ) : (
              <p className="text-center text-gray-300">No allocations found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
