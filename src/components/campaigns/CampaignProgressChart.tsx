
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";

interface CampaignProgressChartProps {
  targetAmount: number;
  completedAmount: number;
  pendingAmount: number;
  showDetails?: boolean;
}

export const CampaignProgressChart: React.FC<CampaignProgressChartProps> = ({
  targetAmount,
  completedAmount,
  pendingAmount,
  showDetails = false,
}) => {
  // Calculate percentages
  const completedPercent = targetAmount > 0 
    ? Math.min(Math.round((completedAmount / targetAmount) * 100), 100) 
    : 0;
  
  const pendingPercent = targetAmount > 0 
    ? Math.min(Math.round((pendingAmount / targetAmount) * 100), 100 - completedPercent) 
    : 0;
  
  const totalPercent = completedPercent + pendingPercent;
  
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
              style={{ width: `${completedPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
            <div 
              style={{ width: `${pendingPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
            ></div>
          </div>
        </div>
      </div>
      
      {/* Detailed breakdown */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Completed: </span>
              <span className="font-medium">{formatCurrency(completedAmount)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Pending: </span>
              <span className="font-medium">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
