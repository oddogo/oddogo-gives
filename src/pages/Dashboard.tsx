import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    loadFingerprints();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadFingerprints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: fingerprintUsers, error: userError } = await supabase
        .from('fingerprints_users')
        .select('id, fingerprint_id')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (userError || !fingerprintUsers) {
        console.log('No fingerprint found for user');
        return;
      }

      const { data: allocationsData, error: allocError } = await supabase
        .from('fingerprints_allocations')
        .select(`
          id,
          allocation_percentage,
          allocation_daf,
          allocation_spotlight,
          allocation_charity_id,
          allocation_subcause_id,
          allocation_region_id,
          allocation_meta_id,
          charities_charities (
            charity_name
          ),
          charities_charity_sub_causes (
            subcause_name
          ),
          charities_charity_regions (
            region_name
          ),
          charities_charity_metadata (
            meta_name
          )
        `)
        .eq('fingerprints_users_id', fingerprintUsers.id)
        .is('deleted_at', null);

      if (allocError) {
        console.error('Error loading allocations:', allocError);
        return;
      }

      if (allocationsData) {
        const processedData = allocationsData.map(item => ({
          id: item.id,
          allocation_percentage: Number(item.allocation_percentage),
          allocation_name: item.charities_charities?.[0]?.charity_name || 
                         item.charities_charity_sub_causes?.[0]?.subcause_name ||
                         item.charities_charity_regions?.[0]?.region_name ||
                         item.charities_charity_metadata?.[0]?.meta_name ||
                         (item.allocation_daf ? 'DAF' : '') ||
                         (item.allocation_spotlight ? 'Spotlight' : '') ||
                         'None - Error',
          allocation_type: item.allocation_charity_id ? 'Charity' :
                         item.allocation_subcause_id ? 'Subcause' :
                         item.allocation_region_id ? 'Region' :
                         item.allocation_meta_id ? 'Meta' :
                         item.allocation_daf ? 'DAF' :
                         item.allocation_spotlight ? 'Spotlight' :
                         'None - Error'
        }));

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
        const newChartData = processedData.map((item, index) => ({
          name: item.allocation_name,
          value: item.allocation_percentage,
          color: colors[index % colors.length]
        }));

        setAllocations(processedData);
        setChartData(newChartData);
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
          <h1 className="text-3xl font-bold mb-8">My Giving Dashboard</h1>
          
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Charity Allocation Chart</h2>
              {allocations.length > 0 ? (
                <DashboardChart data={chartData} />
              ) : (
                <p className="text-center text-gray-300">No allocations found</p>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Allocation Details</h2>
              {allocations.length > 0 ? (
                <AllocationTable data={allocations} />
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
