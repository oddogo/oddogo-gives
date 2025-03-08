
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageIcon } from "lucide-react";
import { Allocation } from "@/types/allocation";
import { COLORS } from "./DashboardChart";

const toSentenceCase = (str: string) => {
  return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

interface AllocationTableProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const AllocationTable = ({ data, hoveredIndex, onHoverChange }: AllocationTableProps) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-black text-sm">Name</TableHead>
            <TableHead className="text-black text-sm text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((allocation, index) => (
            <TableRow 
              key={index}
              className={`transition-colors ${hoveredIndex === index ? 'bg-gray-100' : ''}`}
              onMouseEnter={() => onHoverChange(index)}
              onMouseLeave={() => onHoverChange(null)}
            >
              <TableCell className="text-black">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="break-words font-medium">{toSentenceCase(allocation.allocation_name)}</span>
                  </div>
                  <div className="ml-13">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {allocation.allocation_type}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-black text-sm text-right">{allocation.allocation_percentage * 100}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
