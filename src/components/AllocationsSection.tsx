
import { useState } from 'react';
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";
import type { Allocation } from "@/types/allocation";

interface AllocationsSectionProps {
  allocations: Allocation[];
}

export const AllocationsSection = ({ allocations }: AllocationsSectionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full bg-[#1A1F2C] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
          <div className="w-full md:col-span-4">
            <div className="aspect-square relative w-full bg-white/5 rounded-lg backdrop-blur-sm p-4 border border-white/10">
              <DashboardChart 
                data={allocations} 
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              />
            </div>
          </div>
          <div className="w-full md:col-span-8">
            <div className="bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
              <AllocationTable 
                data={allocations} 
                hoveredIndex={hoveredIndex}
                onHoverChange={setHoveredIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
