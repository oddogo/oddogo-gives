
import React from "react";
import { CampaignNavigation } from "./CampaignNavigation";
import { CampaignStatusBadges } from "./CampaignStatusBadges";
import { CampaignHeroImage } from "./CampaignHeroImage";
import { CampaignProgressDisplay } from "./CampaignProgressDisplay";

interface EnhancedCampaignHeroProps {
  imageUrl?: string | null;
  recipientName: string;
  navigationItems: Array<{id: string, name: string, icon: React.ReactNode}>;
  targetAmount?: number;
  currentAmount?: number;
  percentage?: number;
  daysRemaining?: number | null;
  donorsCount?: number;
  campaignTitle?: string;
  onSupportClick?: () => void;
}

export const EnhancedCampaignHero: React.FC<EnhancedCampaignHeroProps> = ({
  imageUrl,
  recipientName,
  navigationItems,
  targetAmount = 0,
  currentAmount = 0,
  percentage = 0,
  daysRemaining = null,
  donorsCount = 0,
  campaignTitle,
  onSupportClick
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Navigation Header */}
      <CampaignNavigation navigationItems={navigationItems} />
      
      {/* Added spacing below navigation */}
      <div className="pt-6"></div>
      
      {/* Hero section with grid layout in a bordered container with teal border */}
      <div className="relative bg-white max-w-6xl mx-auto rounded-lg border border-gray-200 shadow-sm overflow-hidden" id="donate-section">
        <div className="p-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hero Image - 2/3 width on desktop, full height */}
          <CampaignHeroImage imageUrl={imageUrl} />
          
          {/* Progress Section - 1/3 width on desktop */}
          <CampaignProgressDisplay
            currentAmount={currentAmount}
            percentage={percentage}
            donorsCount={donorsCount}
            recipientName={recipientName}
            onSupportClick={onSupportClick}
          />
        </div>
      </div>
      
      {/* Campaign Status Badges - Centered alignment */}
      <div className="max-w-6xl mx-auto mt-5 mb-2 text-center">
        <CampaignStatusBadges
          recipientName={recipientName}
          daysRemaining={daysRemaining}
        />
      </div>
      
      {/* Campaign Title Section - Use the campaign title instead of "Help Support" */}
      <div className="text-center py-4 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {campaignTitle || `Help Support ${recipientName}`}
          </h1>
        </div>
      </div>
    </div>
  );
};
