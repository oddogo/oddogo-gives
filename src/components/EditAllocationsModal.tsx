
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Allocation } from "@/types/allocation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditAllocationsModalProps {
  allocations: Allocation[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditAllocationsModal = ({ allocations: initialAllocations, onClose, onSuccess }: EditAllocationsModalProps) => {
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [loading, setLoading] = useState(false);

  const handlePercentageChange = (id: number, value: string) => {
    const newValue = Number(value) / 100;
    setAllocations(allocations.map(a => 
      a.id === id ? { ...a, allocation_percentage: newValue } : a
    ));
  };

  const handleRemove = (id: number) => {
    setAllocations(allocations.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const totalPercentage = allocations.reduce((sum, a) => sum + a.allocation_percentage, 0);
      if (Math.abs(totalPercentage - 1) > 0.0001) {
        throw new Error("Total percentage must equal 100%");
      }

      // Update all allocations in a single batch
      const { error } = await supabase
        .from('fingerprints_allocations')
        .upsert(allocations.map(a => ({
          id: a.id,
          allocation_percentage: a.allocation_percentage
        })));

      if (error) throw error;

      toast.success("Allocations updated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = allocations.reduce((sum, a) => sum + a.allocation_percentage, 0) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl bg-[#1A1F2C] border-white/10 p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Allocations</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {allocations.map((allocation) => (
            <div key={allocation.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-lg">
              <div className="flex-1">
                <p className="text-white font-medium">{allocation.allocation_name}</p>
                <p className="text-sm text-gray-400">{allocation.allocation_type}</p>
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={(allocation.allocation_percentage * 100).toFixed(1)}
                  onChange={(e) => handlePercentageChange(allocation.id, e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemove(allocation.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Total: </span>
            <span className={`font-medium ${Math.abs(totalPercentage - 100) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || Math.abs(totalPercentage - 100) > 0.01}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
