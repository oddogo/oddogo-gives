
import React from "react";
import { differenceInDays, format } from "date-fns";
import { Users, Calendar } from "lucide-react";

interface EnhancedCampaignProgressProps {
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  endDate?: string | null;
}

export const EnhancedCampaignProgress: React.FC<EnhancedCampaignProgressProps> = ({
  targetAmount,
  currentAmount,
  percentage,
  endDate
}) => {
  // Calculate days remaining if end date exists
  const daysRemaining = endDate 
    ? Math.max(0, differenceInDays(new Date(endDate), new Date())) 
    : null;
  
  // Mock data for demonstration (in a real app, these would come from the backend)
  const donorsCount = Math.floor(currentAmount / 2500) + 1; // Just a mock formula

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-3xl font-bold text-gray-900">£{(currentAmount / 100).toLocaleString()}</span>
          <span className="text-gray-500 ml-2">raised of £{(targetAmount / 100).toLocaleString()}</span>
        </div>
        <div className="text-lg font-semibold text-primary">{percentage}%</div>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full mt-2 mb-4">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-gray-600">
        <div className="flex items-center gap-1">
          <Users size={16} className="text-primary" />
          <span>{donorsCount} donor{donorsCount !== 1 ? 's' : ''}</span>
        </div>
        
        {daysRemaining !== null && (
          <div className="flex items-center gap-1">
            <Calendar size={16} className="text-primary" />
            <span>
              {daysRemaining > 0 
                ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left` 
                : 'Campaign ended'}
            </span>
          </div>
        )}
        
        {endDate && (
          <div className="text-gray-500 text-sm ml-auto">
            Ends {format(new Date(endDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
};
