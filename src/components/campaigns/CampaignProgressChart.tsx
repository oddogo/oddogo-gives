
import { Progress } from "@/components/ui/progress";

interface CampaignProgressChartProps {
  targetAmount: number;
  completedAmount: number;
  pendingAmount: number;
  showChart?: boolean;
  showDetails?: boolean;
}

export const CampaignProgressChart = ({
  targetAmount,
  completedAmount,
  pendingAmount,
  showDetails = true
}: CampaignProgressChartProps) => {
  // Calculate percentages
  const percentCompleted = Math.min(Math.round((completedAmount / targetAmount) * 100), 100);
  const percentTotal = Math.min(Math.round(((completedAmount + pendingAmount) / targetAmount) * 100), 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };
  
  return (
    <div className="space-y-4">
      {showDetails && (
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <span className="text-sm text-gray-500">Progress</span>
            <div className="text-xl font-bold">{formatCurrency(completedAmount)}</div>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-sm">of {formatCurrency(targetAmount)} goal</span>
            <div className="text-sm font-medium text-gray-900">{percentCompleted}% Complete</div>
          </div>
        </div>
      )}

      <Progress value={percentCompleted} className="h-2.5 bg-gray-200" />
      
      {pendingAmount > 0 && showDetails && (
        <div className="flex justify-between text-xs pt-1">
          <div className="flex items-center gap-1 text-amber-600">
            <span>{formatCurrency(pendingAmount)} pending</span>
          </div>
          <span className="text-gray-500">
            {percentTotal}% with pending payments
          </span>
        </div>
      )}
    </div>
  );
};
