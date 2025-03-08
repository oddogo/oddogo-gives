
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Allocation } from "@/types/allocation";
import { COLORS } from "./DashboardChart";

const toSentenceCase = (str: string) => {
  return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

export const AllocationTable = ({ data }: { data: Allocation[] }) => {
  return (
    <div className="bg-white rounded-lg p-4 h-[300px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-black w-1/2">Name</TableHead>
            <TableHead className="text-black">Type</TableHead>
            <TableHead className="text-black text-center">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((allocation, index) => (
            <TableRow key={index}>
              <TableCell className="text-black">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="break-words">{toSentenceCase(allocation.allocation_name)}</span>
                </div>
              </TableCell>
              <TableCell className="text-black">{allocation.allocation_type}</TableCell>
              <TableCell className="text-black text-center">{allocation.allocation_percentage * 100}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
