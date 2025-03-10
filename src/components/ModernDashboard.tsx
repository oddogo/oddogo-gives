
import { User } from "@supabase/supabase-js";
import { ModernHeader } from "./ModernHeader";
import { ModernContent } from "./ModernContent";
import { Allocation } from "@/types/allocation";

interface ModernDashboardProps {
  user: User | null;
  allocations: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  onSignOut: () => void;
}

export const ModernDashboard = ({ 
  user, 
  allocations, 
  hoveredIndex,
  onHoverChange,
  onSignOut 
}: ModernDashboardProps) => {
  return (
    <div className="min-h-screen bg-[#40B8B8]/10">
      <ModernHeader user={user} />
      <ModernContent 
        allocations={allocations}
        hoveredIndex={hoveredIndex}
        onHoverChange={onHoverChange}
      />
    </div>
  );
};
