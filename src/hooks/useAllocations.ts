
import { useState, useEffect } from 'react';
import { Allocation } from "@/types/allocation";
import { toast } from "sonner";

interface UseAllocations {
  allocations: Allocation[];
  totalPercentage: number;
  error: string | null;
  handlePercentageChange: (index: number, value: number) => void;
  handleDelete: (index: number) => void;
  handleAddAllocation: (newAllocation: Allocation) => void;
}

export const useAllocations = (initialAllocations: Allocation[]): UseAllocations => {
  const [allocations, setAllocations] = useState<Allocation[]>(
    initialAllocations.filter(a => !a.deleted_at)
  );
  const [totalPercentage, setTotalPercentage] = useState(100);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const total = allocations.reduce((sum, a) => sum + (a.allocation_percentage * 100), 0);
    setTotalPercentage(total);

    // Check for zero allocations
    const hasZeroAllocation = allocations.some(a => a.allocation_percentage === 0);
    if (hasZeroAllocation) {
      setError('All allocations must be greater than 0%');
    } else if (Math.abs(total - 100) > 0.001) {
      setError(`Total must equal 100%. Current total: ${total.toFixed(1)}%`);
    } else {
      setError(null);
    }
  }, [allocations]);

  const handlePercentageChange = (index: number, value: number) => {
    const newAllocations = [...allocations];
    newAllocations[index] = {
      ...newAllocations[index],
      allocation_percentage: value / 100
    };
    setAllocations(newAllocations);
  };

  const handleDelete = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleAddAllocation = (newAllocation: Allocation) => {
    // For subcauses, allow multiple entries
    if (newAllocation.allocation_type === 'Subcause') {
      // Check if this exact subcause ID has already been added
      const isDuplicate = allocations.some(allocation => 
        allocation.allocation_type === 'Subcause' && 
        allocation.allocation_subcause_id === newAllocation.allocation_subcause_id
      );

      if (isDuplicate) {
        toast.error('This subcause has already been added');
        return;
      }

      setAllocations([...allocations, newAllocation]);
      return;
    }

    // For charities, check the specific charity ID
    if (newAllocation.allocation_type === 'Charity') {
      const isDuplicate = allocations.some(allocation => 
        allocation.allocation_type === 'Charity' && 
        allocation.id === newAllocation.id
      );

      if (isDuplicate) {
        toast.error('This charity has already been added');
        return;
      }

      setAllocations([...allocations, newAllocation]);
      return;
    }

    // For other types, keep existing validation
    const isDuplicate = allocations.some(allocation => 
      allocation.allocation_type === newAllocation.allocation_type
    );

    if (isDuplicate) {
      toast.error(`This ${newAllocation.allocation_type} has already been added`);
      return;
    }

    setAllocations([...allocations, newAllocation]);
  };

  return {
    allocations,
    totalPercentage,
    error,
    handlePercentageChange,
    handleDelete,
    handleAddAllocation
  };
};
