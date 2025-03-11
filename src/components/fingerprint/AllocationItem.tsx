
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Allocation } from "@/types/allocation";

interface AllocationItemProps {
  allocation: Allocation;
  index: number;
  onPercentageChange: (index: number, value: number) => void;
  onDelete: (index: number) => void;
}

export const AllocationItem = ({
  allocation,
  index,
  onPercentageChange,
  onDelete
}: AllocationItemProps) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
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
            onChange={(e) => onPercentageChange(index, Number(e.target.value))}
            className="bg-white/5 border-white/10"
          />
          <span className="text-white/60">%</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(index)}
        className="hover:bg-white/10"
      >
        <Trash2 className="h-4 w-4 text-white/60" />
      </Button>
    </div>
  );
};
