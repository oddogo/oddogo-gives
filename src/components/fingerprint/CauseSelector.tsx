
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCausesAndSubcauses } from "@/hooks/useCausesAndSubcauses";
import { Allocation } from "@/types/allocation";
import { Sparkles } from "lucide-react";

interface CauseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (allocation: Allocation) => void;
}

export const CauseSelector = ({
  isOpen,
  onClose,
  onSelect
}: CauseSelectorProps) => {
  const { causes, isLoading } = useCausesAndSubcauses();
  const [selectedCauseId, setSelectedCauseId] = useState<number | null>(null);

  const selectedCause = causes.find(c => c.id === selectedCauseId);

  const handleSubcauseSelect = (subcauseId: number, subcauseName: string) => {
    onSelect({
      id: subcauseId.toString(),
      allocation_name: subcauseName,
      allocation_type: 'Subcause',
      allocation_percentage: 0,
      allocation_subcause_id: subcauseId
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Select Cause and Sub-cause</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center py-4">Loading causes...</p>
          ) : (
            <div className="grid gap-4">
              {!selectedCauseId ? (
                // Show causes grid
                <div className="grid grid-cols-2 gap-3">
                  {causes.map((cause) => (
                    <Button
                      key={cause.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 border-white/10 hover:bg-white/10"
                      onClick={() => setSelectedCauseId(cause.id)}
                    >
                      <div className="font-medium text-left">{cause.name}</div>
                      <div className="text-sm text-gray-400 text-left">
                        {cause.subcauses.length} sub-causes
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                // Show subcauses for selected cause
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    className="mb-2"
                    onClick={() => setSelectedCauseId(null)}
                  >
                    ← Back to causes
                  </Button>
                  
                  <div className="grid gap-2">
                    {selectedCause?.subcauses.map((subcause) => (
                      <Button
                        key={subcause.id}
                        variant="outline"
                        className="justify-start border-white/10 hover:bg-white/10"
                        onClick={() => handleSubcauseSelect(subcause.id, subcause.name)}
                      >
                        {subcause.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
