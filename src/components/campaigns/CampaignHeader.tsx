
import React from "react";
import { Zap } from "lucide-react";

interface CampaignHeaderProps {
  title: string;
}

export const CampaignHeader: React.FC<CampaignHeaderProps> = ({ title }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full mb-3 animate-pulse shadow-lg">
        <Zap className="w-5 h-5" />
        <span className="font-bold">Active Campaign</span>
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
    </div>
  );
};
