
import { User } from "@supabase/supabase-js";
import { Allocation } from "@/types/allocation";
import { DashboardChart } from "./DashboardChart";
import { AllocationTable } from "./AllocationTable";
import { Card } from "./ui/card";

interface ModernContentProps {
  user: User | null;
  allocations: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const ModernContent = ({ 
  allocations,
  hoveredIndex,
  onHoverChange 
}: ModernContentProps) => {
  const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation_percentage, 0);
  const uniqueTypes = new Set(allocations.map(a => a.allocation_type)).size;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-purple-500/10 backdrop-blur-sm border-purple-500/20 p-4">
          <h3 className="text-sm font-medium text-purple-200">Total Allocation</h3>
          <p className="text-2xl font-bold text-white">{(totalAllocation * 100).toFixed(0)}%</p>
        </Card>
        
        <Card className="bg-blue-500/10 backdrop-blur-sm border-blue-500/20 p-4">
          <h3 className="text-sm font-medium text-blue-200">Allocation Types</h3>
          <p className="text-2xl font-bold text-white">{uniqueTypes}</p>
        </Card>
        
        <Card className="bg-teal-500/10 backdrop-blur-sm border-teal-500/20 p-4">
          <h3 className="text-sm font-medium text-teal-200">Total Causes</h3>
          <p className="text-2xl font-bold text-white">{allocations.length}</p>
        </Card>
      </div>

      <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-6">Your Charitable Fingerprint™</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="w-full">
            <DashboardChart 
              data={allocations} 
              hoveredIndex={hoveredIndex}
              onHoverChange={onHoverChange}
            />
          </div>
          <div className="w-full">
            <AllocationTable 
              data={allocations} 
              hoveredIndex={hoveredIndex}
              onHoverChange={onHoverChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
