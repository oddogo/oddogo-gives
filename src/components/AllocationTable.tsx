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

const getTypeColor = (type: string): string => {
  switch (type) {
    case 'Charity':
      return 'bg-teal-500/20 text-teal-300';
    case 'Region':
      return 'bg-teal-600/20 text-teal-200';
    case 'Subcause':
      return 'bg-teal-700/20 text-teal-100';
    case 'Meta':
      return 'bg-teal-800/20 text-teal-50';
    default:
      return 'bg-teal-900/20 text-teal-100';
  }
};

interface AllocationTableProps {
  data: Allocation[];
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
}

export const AllocationTable = ({ data, hoveredIndex, onHoverChange }: AllocationTableProps) => {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-white/5 border-white/10">
            <TableHead className="text-gray-400 font-medium">Name</TableHead>
            <TableHead className="text-gray-400 font-medium text-right w-24">Allocation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((allocation, index) => (
            <TableRow 
              key={index}
              className={`
                transition-colors cursor-pointer
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
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    {allocation.website_favicon ? (
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${allocation.website_favicon}&sz=32`}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.className = 'hidden';
                          e.currentTarget.nextSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <ImageIcon className={`w-4 h-4 text-gray-400 ${allocation.website_favicon ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{toSentenceCase(allocation.allocation_name)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(allocation.allocation_type)}`}>
                      {allocation.allocation_type}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="space-y-1">
                  <span className="text-white font-medium">
                    {(allocation.allocation_percentage * 100).toFixed(1)}%
                  </span>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
