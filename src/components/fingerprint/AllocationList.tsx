
import { Allocation } from "@/types/allocation";
import { AllocationItem } from "./AllocationItem";

interface AllocationListProps {
  allocations: Allocation[];
  onPercentageChange: (index: number, value: number) => void;
  onDelete: (index: number) => void;
}

export const AllocationList = ({
  allocations,
  onPercentageChange,
  onDelete
}: AllocationListProps) => {
  return (
    <div className="space-y-4">
      {allocations.map((allocation, index) => (
        <AllocationItem
          key={index}
          allocation={allocation}
          index={index}
          onPercentageChange={onPercentageChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
