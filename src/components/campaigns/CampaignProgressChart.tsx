
import React from "react";
import { CheckCircle, Clock } from "lucide-react";

interface CampaignProgressChartProps {
  targetAmount: number;
  totalAmount: number;
  pendingAmount?: number;
  showDetails?: boolean;
}

export const CampaignProgressChart: React.FC<CampaignProgressChartProps> = ({
  targetAmount,
  totalAmount,
  pendingAmount = 0,
  showDetails = false,
}) => {
  // Calculate percentages
  const completedPercent = targetAmount > 0 
    ? Math.min(Math.round((totalAmount / targetAmount) * 100), 100) 
    : 0;
  
  const pendingPercent = targetAmount > 0
    ? Math.min(Math.round((pendingAmount / targetAmount) * 100), 100)
    : 0;
  
  const totalPercent = Math.min(completedPercent + pendingPercent, 100);
  
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
            {/* Completed amount (green) */}
            <div 
              style={{ width: `${completedPercent}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
            
            {/* Pending amount (amber) */}
            {pendingAmount > 0 && (
              <div 
                style={{ width: `${pendingPercent}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-400"
              ></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Detailed breakdown */}
      {showDetails && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Completed: </span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          
          {pendingAmount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Pending: </span>
                <span className="font-medium">{formatCurrency(pendingAmount)}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span>Total: </span>
              <span>{formatCurrency(totalAmount + pendingAmount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
