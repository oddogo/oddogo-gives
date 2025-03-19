
import { DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/paymentUtils";

interface PaymentSummaryCardsProps {
  totalReceived: number;
  pendingAmount: number;
}

export const PaymentSummaryCards = ({ totalReceived, pendingAmount }: PaymentSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="backdrop-blur-xl bg-green-500/10 p-4 rounded-lg flex items-center justify-between border border-green-500/20">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-green-200">Total Given</span>
        </div>
        <span className="text-lg font-bold text-green-100">
          {formatCurrency(totalReceived)}
        </span>
      </div>
      <div className="backdrop-blur-xl bg-yellow-500/10 p-4 rounded-lg flex items-center justify-between border border-yellow-500/20">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-200">Pending</span>
        </div>
        <span className="text-lg font-bold text-yellow-100">
          {formatCurrency(pendingAmount)}
        </span>
      </div>
    </div>
  );
};
