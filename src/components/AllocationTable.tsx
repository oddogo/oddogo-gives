
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AllocationData = {
  allocation_name: string;
  allocation_percentage: number;
  cause_name: string | null;
};

export const AllocationTable = ({ data }: { data: AllocationData[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Percentage</TableHead>
          <TableHead>Cause</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((allocation, index) => (
          <TableRow key={index}>
            <TableCell>{allocation.allocation_name || 'Unnamed'}</TableCell>
            <TableCell>{allocation.allocation_percentage}%</TableCell>
            <TableCell>{allocation.cause_name || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
