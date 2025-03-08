
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardChart } from "@/components/DashboardChart";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);

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

      const { data, error } = await supabase
        .from('v_fingerprint_live')
        .select('charity_name, allocation_percentage, cause_name')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
        const chartData = data.map((item, index) => ({
          name: item.charity_name || 'Unnamed Charity',
          value: Number(item.allocation_percentage),
          color: colors[index % colors.length]
        }));
        setAllocations(chartData);
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
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Charity Allocation</h2>
            {allocations.length > 0 ? (
              <DashboardChart data={allocations} />
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
