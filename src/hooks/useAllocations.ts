
import { useState, useEffect } from 'react';
import { Allocation } from "@/types/allocation";

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
    if (Math.abs(total - 100) > 0.001) {
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
