
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

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
  showChart = true,
  showDetails = true
}: CampaignProgressChartProps) => {
  // Calculate percentages
  const percentCompleted = Math.min(Math.round((completedAmount / targetAmount) * 100), 100);
  const percentTotal = Math.min(Math.round(((completedAmount + pendingAmount) / targetAmount) * 100), 100);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };

  // Prepare chart data
  const remainingAmount = Math.max(targetAmount - completedAmount - pendingAmount, 0);
  const chartData = [
    { name: 'Completed', value: completedAmount, color: '#10b981' },
    { name: 'Pending', value: pendingAmount, color: '#f59e0b' },
    { name: 'Remaining', value: remainingAmount, color: '#e5e7eb' }
  ].filter(item => item.value > 0);
  
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

      {showChart && chartData.length > 0 && (
        <div className="h-[180px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
