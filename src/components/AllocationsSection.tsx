
import { Allocation } from "@/types/allocation";
import { AllocationTable } from "./AllocationTable";

interface AllocationsSectionProps {
  allocations: Allocation[];
}

export const AllocationsSection = ({ allocations }: AllocationsSectionProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Allocations</h2>
      {allocations.length > 0 ? (
        <AllocationTable 
          data={allocations} 
          hoveredIndex={null} 
          onHoverChange={() => {}}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No allocations found.
        </div>
      )}
    </div>
  );
};
