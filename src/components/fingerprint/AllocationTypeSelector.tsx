import { Button } from "@/components/ui/button";
import { Plus, Building2, Globe2, Tags, Sparkles, PiggyBank } from "lucide-react";
import { AllocationType } from "@/types/allocation";
import { useState } from "react";
import { PartnerCharitySelector } from "./PartnerCharitySelector";
import { CauseSelector } from "./CauseSelector";

interface AllocationTypeSelectorProps {
  onAddAllocation: (allocation: any) => void;
}

export const AllocationTypeSelector = ({ 
  onAddAllocation 
}: AllocationTypeSelectorProps) => {
  const [showCharitySelector, setShowCharitySelector] = useState(false);
  const [showCauseSelector, setShowCauseSelector] = useState(false);

  const handleCharityAdd = (allocation: any) => {
    onAddAllocation(allocation);
  };

  const handleDAFAdd = () => {
    onAddAllocation({
      id: 'daf',
      allocation_name: 'Donor Advised Fund',
      allocation_type: 'DAF',
      allocation_percentage: 0
    });
  };

  const handleSpotlightAdd = () => {
    onAddAllocation({
      id: 'spotlight',
      allocation_name: 'Spotlight Charity',
      allocation_type: 'Spotlight',
      allocation_percentage: 0
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => setShowCharitySelector(true)}
        variant="outline"
        size="sm"
        className="gap-1.5"
      >
        <Building2 className="h-4 w-4" />
        Partner Charity
      </Button>

      <Button
        onClick={() => setShowCauseSelector(true)}
        variant="outline"
        size="sm"
        className="gap-1.5"
      >
        <Tags className="h-4 w-4" />
        Sub-cause
      </Button>

      <Button
        onClick={handleDAFAdd}
        variant="outline"
        size="sm"
        className="gap-1.5"
      >
        <PiggyBank className="h-4 w-4" />
        DAF
      </Button>

      <Button
        onClick={handleSpotlightAdd}
        variant="outline"
        size="sm"
        className="gap-1.5"
      >
        <Sparkles className="h-4 w-4" />
        Spotlight
      </Button>

      <PartnerCharitySelector
        isOpen={showCharitySelector}
        onClose={() => setShowCharitySelector(false)}
        onSelect={onAddAllocation}
      />

      <CauseSelector
        isOpen={showCauseSelector}
        onClose={() => setShowCauseSelector(false)}
        onSelect={onAddAllocation}
      />
    </div>
  );
};
