
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Allocation, AllocationType } from "@/types/allocation";
import { User } from "@supabase/supabase-js";
import { ModernDashboard } from "@/components/ModernDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      setUser(user);
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
      const { data, error } = await supabase
        .from('v_fingerprints_live')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const formattedAllocations: Allocation[] = data.map(item => ({
          id: Number(item.id),
          allocation_name: item.allocation_name,
          allocation_type: item.allocation_type as AllocationType,
          allocation_percentage: Number(item.allocation_percentage),
          cause_name: item.allocation_name
        }));
        setAllocations(formattedAllocations);
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
    <ModernDashboard
      user={user}
      allocations={allocations}
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
      onSignOut={handleSignOut}
    />
  );
};

export default Dashboard;
