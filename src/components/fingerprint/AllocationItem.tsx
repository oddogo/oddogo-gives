
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Sparkles, PiggyBank, Image, Trash2 } from "lucide-react";
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
  const getFallbackIcon = () => {
    switch (allocation.allocation_type) {
      case 'Charity':
        return <Building2 className="h-4 w-4" />;
      case 'Spotlight':
        return <Sparkles className="h-4 w-4" />;
      case 'DAF':
        return <PiggyBank className="h-4 w-4" />;
      default:
        return <Image className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
      <Avatar className="h-8 w-8 bg-white/10">
        {allocation.website_favicon && allocation.allocation_type === 'Charity' ? (
          <AvatarImage
            src={`https://www.google.com/s2/favicons?domain=${allocation.website_favicon}&sz=64`}
            alt={allocation.allocation_name}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const nextElement = target.nextElementSibling;
              if (nextElement instanceof HTMLElement) {
                nextElement.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        <AvatarFallback className="bg-white/10 text-white/60">
          {getFallbackIcon()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <Label htmlFor={`allocation-${index}`} className="text-sm text-white/60 truncate">
          {allocation.allocation_name}
        </Label>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            id={`allocation-${index}`}
            type="number"
            min={0}
            max={100}
            value={Math.round(allocation.allocation_percentage * 100)}
            onChange={(e) => onPercentageChange(index, Number(e.target.value))}
            className="h-8 w-20 bg-white/5 border-white/10 text-right"
          />
          <span className="text-white/60 text-sm">%</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(index)}
        className="h-8 w-8 hover:bg-white/10"
      >
        <Trash2 className="h-4 w-4 text-white/60" />
      </Button>
    </div>
  );
};
