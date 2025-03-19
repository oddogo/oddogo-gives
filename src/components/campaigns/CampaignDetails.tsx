
import React from "react";
import { Calendar } from "lucide-react";
import { CampaignProgressChart } from "./CampaignProgressChart";

interface CampaignDetailsProps {
  description: string | null;
  imageUrl: string | null;
  targetAmount: number;
  totalAmount: number;
  pendingAmount?: number;
  endDate: string | null;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  description,
  imageUrl,
  targetAmount,
  totalAmount,
  pendingAmount = 0,
  endDate,
}) => {
  // Format end date if it exists
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {imageUrl && (
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Campaign image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        <div className={imageUrl ? "md:w-2/3" : "w-full"}>
          <p className="text-gray-600 mb-6 text-lg">
            {description}
          </p>
          
          <div className="space-y-4 mb-6">
            <CampaignProgressChart 
              targetAmount={targetAmount} 
              totalAmount={totalAmount}
              pendingAmount={pendingAmount}
              showDetails={true}
            />
              
            {endDate && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Ends {formatDate(endDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
