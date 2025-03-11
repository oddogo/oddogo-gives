import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/Logo";
import { Allocation, AllocationType } from "@/types/allocation";
import { UserInfo } from "@/components/UserInfo";
import { User } from "@supabase/supabase-js";
import { ModernDashboard } from "@/components/ModernDashboard";
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isModernLayout, setIsModernLayout] = useState(() => {
    return localStorage.getItem("dashboardLayout") === "modern";
  });

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
      console.log('Current authenticated user:', user);
      setUser(user);
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
          id: item.allocation_charity_id,
          allocation_name: item.allocation_name,
          allocation_type: item.allocation_type as AllocationType,
          allocation_percentage: Number(item.allocation_percentage),
          cause_name: item.allocation_name
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

  const toggleLayout = () => {
    const newLayout = !isModernLayout;
    setIsModernLayout(newLayout);
    localStorage.setItem("dashboardLayout", newLayout ? "modern" : "classic");
  };

  if (loading) return null;

  if (isModernLayout) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur-xl p-2 rounded-full">
          <span className="text-sm text-white/60">Modern Layout</span>
          <Switch checked={isModernLayout} onCheckedChange={toggleLayout} />
        </div>
        <ModernDashboard
          user={user}
          allocations={allocations}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          onSignOut={handleSignOut}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Logo />
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Modern Layout</span>
              <Switch checked={isModernLayout} onCheckedChange={toggleLayout} />
            </div>
            <Button onClick={() => navigate("/profile")} variant="outline">
              Profile
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            {user && <UserInfo user={user} />}
          </div>

          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Your Charitable Fingerprint™</h1>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              {/* Remove FingerPrintList reference */}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Allocation Overview</h2>
              {allocations.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="w-full">
                    <DashboardChart 
                      data={allocations} 
                      hoveredIndex={hoveredIndex}
                      onHoverChange={setHoveredIndex}
                    />
                  </div>
                  <div className="w-full">
                    <AllocationTable 
                      data={allocations} 
                      hoveredIndex={hoveredIndex}
                      onHoverChange={setHoveredIndex}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-300">No allocations found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
