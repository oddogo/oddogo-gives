import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Allocation, AllocationType } from "@/types/allocation";
import { ModernDashboard } from "@/components/ModernDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkUser();
  }, [refreshKey]);

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
        .select(`
          *,
          charities:allocation_charity_id (
            website
          )
        `)
        .eq('user_id', userId);

      console.log('Raw response:', { data, error });

      if (error) throw error;

      if (data) {
        const formattedAllocations: Allocation[] = data.map(item => ({
          id: item.allocation_charity_id,
          allocation_name: item.allocation_name,
          allocation_type: item.allocation_type as AllocationType,
          allocation_percentage: Number(item.allocation_percentage),
          cause_name: item.allocation_name,
          website_favicon: item.charities?.website || null
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return null;

  return (
    <ModernDashboard
      user={user}
      allocations={allocations}
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
      onSignOut={handleSignOut}
      onRefresh={handleRefresh}
    />
  );
};

export default Dashboard;
