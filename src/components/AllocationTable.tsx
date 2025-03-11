
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { EditAllocationsModal } from "./EditAllocationsModal";
import { AllocationTableHeader } from "./AllocationTableHeader";
import { AllocationTableRow } from "./AllocationTableRow";
import type { Allocation } from "@/types/allocation";

interface AllocationTableProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const AllocationTable = ({ data, hoveredIndex, onHoverChange }: AllocationTableProps) => {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="rounded-lg bg-[#1A1F2C]/95 border border-white/10 backdrop-blur-sm overflow-hidden w-full">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Allocations</h3>
        <Button 
          variant="outline" 
          onClick={() => setShowEditModal(true)}
          className="gap-2 border-white/10"
        >
          <Settings2 className="h-4 w-4" />
          Edit All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <AllocationTableHeader />
          <TableBody>
            {data.map((allocation, index) => (
              <AllocationTableRow
                key={allocation.id}
                allocation={allocation}
                index={index}
                hoveredIndex={hoveredIndex}
                onHoverChange={onHoverChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {showEditModal && (
        <EditAllocationsModal
          allocations={data}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
};
