
import React from "react";
import { CompactFingerprintList } from "./CompactFingerprintList";
import { Allocation } from "@/types/allocation";

interface CampaignSidebarProps {
  allocations: Allocation[];
  firstName: string;
}

export const CampaignSidebar: React.FC<CampaignSidebarProps> = ({
  allocations,
  firstName
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      <div className="p-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
      <div className="p-6">
        {/* Expanded Fingerprint section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <CompactFingerprintList 
            allocations={allocations}
            firstName={firstName}
          />
        </div>
      </div>
    </div>
  );
};
