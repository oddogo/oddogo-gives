
import React from "react";
import { differenceInDays, format } from "date-fns";
import { Users, Calendar, Clock, Target } from "lucide-react";

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

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-teal-500';
    if (percent >= 25) return 'bg-cyan-500';
    return 'bg-blue-500';
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
        <div className="space-y-1">
          <p className="text-gray-500 text-sm font-medium">Raised so far</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">£{(currentAmount / 100).toLocaleString()}</span>
            <span className="text-gray-500 ml-2 text-sm">of £{(targetAmount / 100).toLocaleString()} target</span>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
          <Target className="w-5 h-5 text-primary mr-2" />
          <span className="text-lg font-semibold">{percentage}% Complete</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-4 bg-gray-100 rounded-full mt-2 mb-6 overflow-hidden">
        <div 
          className={`h-full ${getProgressColor(percentage)} rounded-full transition-all duration-1000 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 flex items-center">
          <Users size={20} className="text-primary mr-3" />
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Supporters</p>
            <p className="font-semibold">{donorsCount} donor{donorsCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {daysRemaining !== null && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center">
            <Clock size={20} className="text-primary mr-3" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Time Left</p>
              <p className="font-semibold">
                {daysRemaining > 0 
                  ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` 
                  : 'Campaign ended'}
              </p>
            </div>
          </div>
        )}
        
        {endDate && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center">
            <Calendar size={20} className="text-primary mr-3" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">End Date</p>
              <p className="font-semibold">{format(new Date(endDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
