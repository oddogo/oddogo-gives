
import { Allocation } from "@/types/allocation";
import { AllocationTable } from "./AllocationTable";
import { DashboardChart } from "./DashboardChart";
import { Card } from "./ui/card";

interface AllocationsSectionProps {
  allocations: Allocation[];
  hoveredIndex?: number | null;
  onHoverChange?: (index: number | null) => void;
}

export const AllocationsSection = ({ 
  allocations, 
  hoveredIndex = null,
  onHoverChange = () => {}
}: AllocationsSectionProps) => {
  return (
    <div className="p-6 space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-6">
        <h2 className="text-2xl font-semibold mb-6 text-white">My Charitable Fingerprint™</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="w-full bg-[#1A1F2C] rounded-lg backdrop-blur-sm p-4 border border-white/10">
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

