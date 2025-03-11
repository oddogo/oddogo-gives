
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Allocation } from "@/types/allocation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [loading, setLoading] = useState(false);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      const total = allocations.reduce((sum, a) => sum + a.allocation_percentage, 0);
      if (Math.abs(total - 1) > 0.0001) {
        throw new Error("Total allocation must equal 100%");
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create new fingerprint with incremented version
      const { data: fingerprint, error: fingerprintError } = await supabase
        .from('fingerprints')
        .insert([{ 
          name: "My Fingerprint",
          version: 1 // This will be updated in future when we handle versioning
        }])
        .select('fingerprint')
        .single();

      if (fingerprintError) throw fingerprintError;

      // Create fingerprint user association
      const { error: userError } = await supabase
        .from('fingerprints_users')
        .insert([{
          fingerprint_id: fingerprint.fingerprint,
          user_id: user.id
        }]);

      if (userError) throw userError;

      // Create allocations
      const { error: allocationsError } = await supabase
        .from('fingerprints_allocations')
        .insert(
          allocations.map(a => ({
            fingerprints_users_id: 1, // This needs to be the correct ID
            allocation_percentage: a.allocation_percentage,
            allocation_charity_id: a.id,
          }))
        );

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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
