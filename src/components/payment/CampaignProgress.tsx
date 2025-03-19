
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Payment } from "@/types/payment";
import { formatCurrency, calculateTotals } from "@/utils/paymentUtils";

interface CampaignProgressProps {
  campaignId: string;
  payments: Payment[];
}

export const CampaignProgress = ({ campaignId, payments }: CampaignProgressProps) => {
  const campaignTitle = payments[0]?.campaign_title || 'Campaign';
  const { completed: completedAmount, pending: pendingAmount, total: totalAmount } = calculateTotals(payments);
  
  console.log(`Rendering campaign progress for ${campaignId}:`, { 
    title: campaignTitle, 
    payments: payments.length,
    completed: completedAmount,
    pending: pendingAmount,
    total: totalAmount,
    paymentDetails: payments.map(p => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      campaign_id: p.campaign_id
    }))
  });
  
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{campaignTitle}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-3 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Total received</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600 font-medium">Completed</span>
              <span className="text-green-600">{formatCurrency(completedAmount)}</span>
            </div>
            <Progress 
              value={totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0} 
              className="h-2 bg-gray-200" 
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-amber-600 font-medium">Pending</span>
              <span className="text-amber-600">{formatCurrency(pendingAmount)}</span>
            </div>
            <Progress 
              value={totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0} 
              className="h-2 bg-gray-200" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
