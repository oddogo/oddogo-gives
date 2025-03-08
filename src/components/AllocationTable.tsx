
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Allocation } from "@/types/allocation";

export const AllocationTable = ({ data }: { data: Allocation[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((allocation, index) => (
          <TableRow key={index}>
            <TableCell>{allocation.allocation_name}</TableCell>
            <TableCell>{allocation.allocation_type}</TableCell>
            <TableCell>{allocation.allocation_percentage * 100}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
