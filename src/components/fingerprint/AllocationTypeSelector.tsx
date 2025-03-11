
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AllocationType } from "@/types/allocation";

type ValidAllocationType = Exclude<AllocationType, 'None - Error'>;

interface AllocationTypeSelectorProps {
  allocationType: ValidAllocationType;
  onTypeChange: (type: ValidAllocationType) => void;
  onAdd: () => void;
}

export const AllocationTypeSelector = ({ 
  allocationType, 
  onTypeChange, 
  onAdd 
}: AllocationTypeSelectorProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Select
        value={allocationType}
        onValueChange={(value) => {
          // Cast the value as ValidAllocationType since we know it can only be valid values from SelectItem
          onTypeChange(value as ValidAllocationType)
        }}
      >
        <SelectTrigger className="w-[200px] bg-[#2A2F3C] border-white/10 text-white">
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
        onClick={onAdd}
        className="gap-2"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add Allocation
      </Button>
    </div>
  );
};
