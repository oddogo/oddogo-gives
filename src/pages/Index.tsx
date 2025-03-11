
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ModernDashboard } from "@/components/ModernDashboard";
import { useAllocations } from "@/hooks/useAllocations";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { allocations, refreshAllocations } = useAllocations();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <ModernDashboard 
          user={user}
          allocations={allocations}
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          onSignOut={handleSignOut}
          onRefresh={refreshAllocations}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white p-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Welcome to Oddogo</h1>
            <div className="text-center py-8">
              Please sign in to continue
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
