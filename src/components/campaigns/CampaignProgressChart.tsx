
import React from "react";
import { CheckCircle } from "lucide-react";

interface CampaignProgressChartProps {
  targetAmount: number;
  totalAmount: number;
  showDetails?: boolean;
}

export const CampaignProgressChart: React.FC<CampaignProgressChartProps> = ({
  targetAmount,
  totalAmount,
  showDetails = false,
}) => {
  // Calculate percentages
  const totalPercent = targetAmount > 0 
    ? Math.min(Math.round((totalAmount / targetAmount) * 100), 100) 
    : 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span>{totalPercent}% of {formatCurrency(targetAmount)}</span>
        </div>
        
        <div className="relative pt-1">
          <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
            <div 
              style={{ width: `${totalPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>
      </div>
      
      {/* Detailed breakdown */}
      {showDetails && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Total: </span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
