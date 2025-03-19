
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MessageSquare } from "lucide-react";
import { Payment } from "@/types/payment";
import { formatCurrency, formatDate } from "@/utils/paymentUtils";

interface PaymentsTableProps {
  payments: Payment[];
}

export const PaymentsTable = ({ payments }: PaymentsTableProps) => {
  return (
    <div className="rounded-md border border-white/20 overflow-hidden backdrop-blur-xl bg-slate-900/30">
      <Table>
        <TableHeader>
          <TableRow className="border-white/20 hover:bg-white/5">
            <TableHead className="text-white/90">Date</TableHead>
            <TableHead className="text-white/90">Amount</TableHead>
            <TableHead className="text-white/90">Status</TableHead>
            <TableHead className="text-white/90">Campaign</TableHead>
            <TableHead className="text-white/90">From</TableHead>
            <TableHead className="text-white/90">Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="border-white/20 hover:bg-white/5">
              <TableCell className="text-white">
                {formatDate(payment.created_at)}
              </TableCell>
              <TableCell className="font-medium text-white">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${payment.status === 'completed' ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'}`
                }>
                  {payment.status}
                </span>
              </TableCell>
              <TableCell className="text-white/80">
                {payment.campaign_title || 'Direct Donation'}
              </TableCell>
              <TableCell className="text-white/80">
                {payment.donor_name || payment.stripe_payment_email || 'Anonymous'}
              </TableCell>
              <TableCell className="text-white/80">
                {payment.message ? (
                  <div className="flex items-center">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    <span className="truncate max-w-[150px]">{payment.message}</span>
                  </div>
                ) : ''}
              </TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-white/70 py-8">
                No donations made yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
