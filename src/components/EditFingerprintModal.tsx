
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Allocation, AllocationType } from "@/types/allocation";
import { useAllocationOptions } from "@/hooks/useAllocationOptions";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useAllocations } from "@/hooks/useAllocations";
import { AllocationTypeSelector } from './fingerprint/AllocationTypeSelector';
import { AllocationList } from './fingerprint/AllocationList';
import { SaveSection } from './fingerprint/SaveSection';

interface EditFingerprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  allocations: Allocation[];
  onSuccess?: () => void;
}

export const EditFingerprintModal = ({ 
  isOpen, 
  onClose, 
  allocations: initialAllocations,
  onSuccess 
}: EditFingerprintModalProps) => {
  const [allocationType, setAllocationType] = useState<Exclude<AllocationType, 'None - Error'>>('Charity');
  const { options, isLoading } = useAllocationOptions();
  const { loading, error: saveError, saveFingerprint } = useFingerprint(onSuccess);
  const {
    allocations,
    totalPercentage,
    error: validationError,
    handlePercentageChange,
    handleDelete,
    handleAddAllocation
  } = useAllocations(initialAllocations);

  const handleAddNew = () => {
    let newAllocation: Allocation;

    switch (allocationType) {
      case 'DAF':
        newAllocation = {
          id: 'daf',
          allocation_name: 'Donor Advised Fund',
          allocation_type: 'DAF',
          allocation_percentage: 0
        };
        break;
      case 'Spotlight':
        newAllocation = {
          id: 'spotlight',
          allocation_name: 'Spotlight Charity',
          allocation_type: 'Spotlight',
          allocation_percentage: 0
        };
        break;
      default:
        return;
    }

    handleAddAllocation(newAllocation);
  };

  const handleSave = async () => {
    if (validationError) return;
    await saveFingerprint(allocations);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Update Your Fingerprint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(validationError || saveError) && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
              {validationError || saveError}
            </div>
          )}

          <AllocationTypeSelector
            allocationType={allocationType}
            onTypeChange={(value) => setAllocationType(value)}
            onAdd={handleAddNew}
          />

          <AllocationList
            allocations={allocations}
            onPercentageChange={handlePercentageChange}
            onDelete={handleDelete}
          />

          <SaveSection
            totalPercentage={totalPercentage}
            error={validationError || saveError}
            loading={loading}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
