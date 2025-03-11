
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCausesAndSubcauses } from "@/hooks/useCausesAndSubcauses";
import { Allocation } from "@/types/allocation";
import { Search, ArrowLeft } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredCauses = causes.filter(cause => {
    const matchesCause = cause.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubcause = cause.subcauses.some(subcause => 
      subcause.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCause || matchesSubcause;
  });

  const filteredSubcauses = selectedCause?.subcauses.filter(subcause =>
    subcause.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-[#1A1F2C] text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Select Cause and Sub-cause</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search causes and sub-causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-transparent border-white/10"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center py-4">Loading causes...</p>
          ) : (
            <div className="space-y-4">
              {!selectedCauseId ? (
                // Show causes as tags with subcause counts
                <div className="flex flex-wrap gap-2">
                  {filteredCauses.map((cause) => (
                    <Button
                      key={cause.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCauseId(cause.id)}
                      className="rounded-full border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {cause.name} ({cause.subcauses.length})
                    </Button>
                  ))}
                </div>
              ) : (
                // Show subcauses for selected cause
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 gap-2"
                    onClick={() => setSelectedCauseId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to causes
                  </Button>
                  
                  <div className="flex flex-wrap gap-2">
                    {filteredSubcauses?.map((subcause) => (
                      <Button
                        key={subcause.id}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-white/10 hover:bg-white/10 transition-colors"
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
