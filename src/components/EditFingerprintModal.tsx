
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Allocation, AllocationType } from "@/types/allocation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAllocationOptions } from "@/hooks/useAllocationOptions";
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
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations.filter(a => !a.deleted_at));
  const [loading, setLoading] = useState(false);
  const [totalPercentage, setTotalPercentage] = useState(100);
  const [error, setError] = useState<string | null>(null);
  // Update the type to match the valid allocation types we want to support
  const [allocationType, setAllocationType] = useState<Exclude<AllocationType, 'None - Error'>>('Charity');
  const { options, isLoading } = useAllocationOptions();

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

  const handleAddAllocation = () => {
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
        return; // Don't add if no selection made
    }

    setAllocations([...allocations, newAllocation]);
  };

  const handleSave = async () => {
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: fingerprintsUsers, error: fingerprintsUsersError } = await supabase
        .from('fingerprints_users')
        .select('id, fingerprint_id')
        .eq('user_id', user.id)
        .single();

      if (fingerprintsUsersError) throw fingerprintsUsersError;
      if (!fingerprintsUsers) throw new Error("No fingerprint found for user");

      // First, mark all existing allocations as deleted
      const { error: updateError } = await supabase
        .from('fingerprints_allocations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('fingerprints_users_id', fingerprintsUsers.id)
        .is('deleted_at', null);

      if (updateError) throw updateError;

      // Get current version
      const { data: currentVersionData, error: versionError } = await supabase
        .from('fingerprints_allocations')
        .select('version')
        .eq('fingerprints_users_id', fingerprintsUsers.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError && versionError.code !== 'PGRST116') throw versionError;
      const newVersion = (currentVersionData?.version || 0) + 1;

      // Then insert new allocations
      const allocationsToInsert = allocations.map(a => {
        const baseAllocation = {
          fingerprints_users_id: fingerprintsUsers.id,
          allocation_percentage: a.allocation_percentage,
          version: newVersion,
        };

        switch (a.allocation_type) {
          case 'Charity':
            return { ...baseAllocation, allocation_charity_id: a.id };
          case 'Subcause':
            return { ...baseAllocation, allocation_subcause_id: Number(a.id) };
          case 'Region':
            return { ...baseAllocation, allocation_region_id: Number(a.id) };
          case 'Meta':
            return { ...baseAllocation, allocation_meta_id: Number(a.id) };
          case 'DAF':
            return { ...baseAllocation, allocation_daf: true };
          case 'Spotlight':
            return { ...baseAllocation, allocation_spotlight: true };
          default:
            throw new Error(`Invalid allocation type: ${a.allocation_type}`);
        }
      });

      const { error: allocationsError } = await supabase
        .from('fingerprints_allocations')
        .insert(allocationsToInsert);

      if (allocationsError) throw allocationsError;

      // Update fingerprint version
      const { error: fingerprintError } = await supabase
        .from('fingerprints')
        .update({ 
          version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq('fingerprint', fingerprintsUsers.fingerprint_id);

      if (fingerprintError) throw fingerprintError;

      toast.success("Fingerprint updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Update Your Fingerprint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <AllocationTypeSelector
            allocationType={allocationType}
            onTypeChange={(value) => setAllocationType(value)}
            onAdd={handleAddAllocation}
          />

          <AllocationList
            allocations={allocations}
            onPercentageChange={handlePercentageChange}
            onDelete={handleDelete}
          />

          <SaveSection
            totalPercentage={totalPercentage}
            error={error}
            loading={loading}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
