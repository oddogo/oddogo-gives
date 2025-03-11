
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AllocationTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="hover:bg-white/5 border-white/10">
        <TableHead className="text-gray-400 font-medium">Name</TableHead>
        <TableHead className="text-gray-400 font-medium text-right w-24">Allocation</TableHead>
        <TableHead className="text-gray-400 font-medium w-20">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
