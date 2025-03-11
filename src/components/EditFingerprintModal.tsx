
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Allocation } from "@/types/allocation";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAllocationOptions } from "@/hooks/useAllocationOptions";

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
  const [allocationType, setAllocationType] = useState<'Charity' | 'Subcause' | 'Meta' | 'Region' | 'DAF' | 'Spotlight'>('Charity');
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

      const { data: currentVersionData, error: versionError } = await supabase
        .from('fingerprints_allocations')
        .select('version')
        .eq('fingerprints_users_id', fingerprintsUsers.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError && versionError.code !== 'PGRST116') throw versionError;
      const newVersion = (currentVersionData?.version || 0) + 1;

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

      toast.success("Fingerprint updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
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

          <div className="flex gap-2 items-center">
            <Select
              value={allocationType}
              onValueChange={(value: any) => setAllocationType(value)}
            >
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Charity">Partner Charity</SelectItem>
                <SelectItem value="Subcause">Sub Cause</SelectItem>
                <SelectItem value="Region">Region</SelectItem>
                <SelectItem value="Meta">Tag</SelectItem>
                <SelectItem value="DAF">Donor Advised Fund</SelectItem>
                <SelectItem value="Spotlight">Spotlight Charity</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddAllocation}
              className="gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add Allocation
            </Button>
          </div>

          <div className="space-y-4">
            {allocations.map((allocation, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                <div className="flex-1">
                  <Label htmlFor={`allocation-${index}`} className="text-white/60">
                    {allocation.allocation_name}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`allocation-${index}`}
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(allocation.allocation_percentage * 100)}
                      onChange={(e) => handlePercentageChange(index, Number(e.target.value))}
                      className="bg-white/5 border-white/10"
                    />
                    <span className="text-white/60">%</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(index)}
                  className="hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4 text-white/60" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-white/60">
              Total: {totalPercentage.toFixed(1)}%
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-white/10">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading || !!error}
                className={error ? "opacity-50 cursor-not-allowed" : ""}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
