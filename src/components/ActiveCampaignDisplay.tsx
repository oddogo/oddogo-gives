
import React from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { CampaignHeader } from "./campaigns/CampaignHeader";
import { CampaignDetails } from "./campaigns/CampaignDetails";

interface ActiveCampaignDisplayProps {
  userId: string;
}

export const ActiveCampaignDisplay: React.FC<ActiveCampaignDisplayProps> = ({ userId }) => {
  const { campaign, totalAmount, loading } = useCampaignData(userId);

  if (loading) {
    return (
      <div className="text-center px-4 sm:px-0 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-full mb-4 mx-auto"></div>
        <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 mx-auto"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2 mx-auto"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded mb-2 mx-auto"></div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="w-full py-12 bg-gray-50" id="campaign">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <CampaignHeader title={campaign.title} />

        <CampaignDetails 
          description={campaign.description}
          imageUrl={campaign.image_url}
          targetAmount={campaign.target_amount}
          totalAmount={totalAmount}
          endDate={campaign.end_date}
        />
      </div>
    </div>
  );
};
