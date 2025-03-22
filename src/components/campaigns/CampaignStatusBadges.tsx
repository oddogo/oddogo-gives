
import React from "react";
import { Heart, Calendar } from "lucide-react";

interface CampaignStatusBadgesProps {
  recipientName: string;
  daysRemaining: number | null;
}

export const CampaignStatusBadges: React.FC<CampaignStatusBadgesProps> = ({
  recipientName,
  daysRemaining
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 mb-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 flex items-center gap-2">
          <Heart size={16} className="text-teal-600 fill-teal-600" />
          <span className="text-sm font-medium text-teal-700">{recipientName.split(' ')[0]}'s Campaign</span>
        </div>
        
        {daysRemaining !== null && (
          <div className="flex items-center gap-1.5 text-sm bg-gray-100 px-3 py-1 rounded-full">
            <Calendar size={14} className="text-teal-600" />
            <span className="font-medium text-gray-700">
              {daysRemaining > 0 
                ? `${daysRemaining} days left` 
                : 'Campaign ended'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
