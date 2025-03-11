
import { User } from "@supabase/supabase-js";
import { Allocation } from "@/types/allocation";
import { DashboardSidebar } from "./DashboardSidebar";
import { ModernHeader } from "./ModernHeader";
import { ModernContent } from "./ModernContent";

interface ModernDashboardProps {
  user: User | null;
  allocations: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  onSignOut: () => void;
  onRefresh: () => void;
}

export const ModernDashboard = ({ 
  user,
  allocations,
  hoveredIndex,
  onHoverChange,
  onSignOut,
  onRefresh
}: ModernDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2C1F3C] text-white">
      <div className="flex">
        <DashboardSidebar user={user} onSignOut={onSignOut} />
        <div className="flex-1">
          <ModernHeader user={user} />
          <ModernContent 
            user={user}
            allocations={allocations}
            hoveredIndex={hoveredIndex}
            onHoverChange={onHoverChange}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  );
};
