
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Allocation } from "@/types/allocation";
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
  const { loading, error: saveError, saveFingerprint } = useFingerprint(onSuccess);
  const {
    allocations,
    totalPercentage,
    error: validationError,
    handlePercentageChange,
    handleDelete,
    handleAddAllocation
  } = useAllocations(initialAllocations);

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
          <AllocationTypeSelector onAddAllocation={handleAddAllocation} />

          <AllocationList
            allocations={allocations}
            onPercentageChange={handlePercentageChange}
            onDelete={handleDelete}
          />

          {(validationError || saveError) && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
              {validationError || saveError}
            </div>
          )}

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
