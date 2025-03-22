
import React from "react";
import { differenceInDays, format } from "date-fns";
import { Users, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Progress</h3>
      
      {/* Progress indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-baseline">
          <span className="text-3xl font-bold text-teal-700">{formatCurrency(currentAmount)}</span>
          <span className="text-gray-500 ml-2">of {formatCurrency(targetAmount)}</span>
        </div>
        <div className="mt-2">
          <Progress value={percentage} className="h-2.5 bg-gray-100" />
        </div>
        <p className="mt-2 text-teal-700 font-semibold">{percentage}% Complete</p>
      </div>
      
      {/* Stats cards in a cleaner layout */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 uppercase font-medium mb-1">Supporters</p>
          <div className="flex items-center justify-center gap-2">
            <Users size={18} className="text-teal-600" />
            <p className="text-lg font-semibold text-gray-900">{donorsCount}</p>
          </div>
        </div>
        
        {endDate && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 uppercase font-medium mb-1">
              {daysRemaining && daysRemaining > 0 ? 'Ends In' : 'Ended On'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} className="text-teal-600" />
              <p className="text-lg font-semibold text-gray-900">
                {daysRemaining && daysRemaining > 0 
                  ? `${daysRemaining} days` 
                  : format(new Date(endDate), 'MMM d')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
