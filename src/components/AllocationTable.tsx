
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageIcon, Pencil } from "lucide-react";
import { Allocation } from "@/types/allocation";
import { COLORS } from "./DashboardChart";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const toSentenceCase = (str: string) => {
  return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

const typeWidths: Record<string, string> = {
  'Charity': 'w-24',
  'Region': 'w-20',
  'Subcause': 'w-24',
  'Meta': 'w-20',
};

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Charity':
      return 'bg-rose-500/20 text-rose-300';
    case 'Region':
      return 'bg-amber-500/20 text-amber-300';
    case 'Subcause':
      return 'bg-lime-500/20 text-lime-300';
    case 'Meta':
      return 'bg-indigo-500/20 text-indigo-300';
    default:
      return 'bg-violet-500/20 text-violet-300';
  }
};

interface AllocationTableProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const AllocationTable = ({ data, hoveredIndex, onHoverChange }: AllocationTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedPercentage, setEditedPercentage] = useState<string>("");

  const handleEdit = (allocation: Allocation) => {
    setEditingId(allocation.id);
    setEditedPercentage(String(allocation.allocation_percentage * 100));
  };

  const handleSave = async (allocation: Allocation) => {
    try {
      const newPercentage = Number(editedPercentage) / 100;
      
      const { error } = await supabase
        .from('v_fingerprints_live')
        .update({ allocation_percentage: newPercentage })
        .eq('id', allocation.id);

      if (error) throw error;

      toast.success("Allocation updated successfully!");
      setEditingId(null);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast.error("Error updating allocation: " + error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedPercentage("");
  };

  return (
    <div className="rounded-lg bg-[#1A1F2C]/95 border border-white/10 backdrop-blur-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5 border-white/10">
              <TableHead className="text-gray-400 font-medium">Name</TableHead>
              <TableHead className="text-gray-400 font-medium text-right w-24">Allocation</TableHead>
              <TableHead className="text-gray-400 font-medium w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((allocation, index) => (
              <TableRow 
                key={index}
                className={`
                  transition-colors cursor-pointer bg-transparent
                  ${hoveredIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}
                  border-white/10
                `}
                onMouseEnter={() => onHoverChange(index)}
                onMouseLeave={() => onHoverChange(null)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      {allocation.website_favicon ? (
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${allocation.website_favicon}&sz=64`}
                          alt=""
                          className="w-8 h-8"
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
                      <ImageIcon className={`w-6 h-6 text-gray-400 ${allocation.website_favicon ? 'hidden' : ''}`} />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-white font-medium">{toSentenceCase(allocation.allocation_name)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full inline-flex justify-center items-center ${getTypeColor(allocation.allocation_type)} ${typeWidths[allocation.allocation_type] || 'w-24'}`}>
                        {allocation.allocation_type}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="space-y-1">
                    {editingId === allocation.id ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editedPercentage}
                        onChange={(e) => setEditedPercentage(e.target.value)}
                        className="w-24 bg-white/5 border-white/10 text-white"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {(allocation.allocation_percentage * 100).toFixed(1)}%
                      </span>
                    )}
                    <div className="w-full bg-white/10 rounded-full h-1">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${allocation.allocation_percentage * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === allocation.id ? (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSave(allocation)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(allocation)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
