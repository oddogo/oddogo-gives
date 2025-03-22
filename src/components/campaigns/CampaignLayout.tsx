
import React from "react";
import { CampaignContentSection } from "./CampaignContentSection";
import { CampaignSidebar } from "./CampaignSidebar";
import { Allocation } from "@/types/allocation";

interface CampaignLayoutProps {
  campaign: any;
  userId: string;
  recipientName: string;
  firstName: string;
  allocations: Allocation[];
  isDonationOpen: boolean;
  setIsDonationOpen: (open: boolean) => void;
}

export const CampaignLayout: React.FC<CampaignLayoutProps> = ({
  campaign,
  userId,
  recipientName,
  firstName,
  allocations,
  isDonationOpen,
  setIsDonationOpen
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main content area - 2/3 width */}
      <div className="md:col-span-2">
        <CampaignContentSection 
          campaign={campaign}
          userId={userId}
          recipientName={recipientName}
          firstName={firstName}
          isDonationOpen={isDonationOpen}
          setIsDonationOpen={setIsDonationOpen}
        />
      </div>
      
      {/* Sidebar - 1/3 width */}
      <div className="md:col-span-1">
        <CampaignSidebar 
          allocations={allocations}
          firstName={firstName}
        />
      </div>
    </div>
  );
};
