
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AllocationData = {
  id: number;
  allocation_percentage: number;
  allocation_name: string;
  allocation_type: string;
};

export const AllocationTable = ({ data }: { data: AllocationData[] }) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Allocation Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.allocation_type}</TableCell>
              <TableCell>{row.allocation_name}</TableCell>
              <TableCell className="text-right">{row.allocation_percentage}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
