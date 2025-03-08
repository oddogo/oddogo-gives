
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

export const AllocationTable = ({ data }: { data: Allocation[] }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((allocation, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {allocation.allocation_name}
                </div>
              </TableCell>
              <TableCell>{allocation.allocation_type}</TableCell>
              <TableCell className="text-center">{allocation.allocation_percentage * 100}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
