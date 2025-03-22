
import React from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { EnhancedCampaignHero } from "./EnhancedCampaignHero";
import { EnhancedCampaignProgress } from "./EnhancedCampaignProgress";
import { EnhancedCampaignStory } from "./EnhancedCampaignStory";
import { PaymentForm } from "@/components/PaymentForm";
import { HandHeart } from "lucide-react";

interface EnhancedCampaignDisplayProps {
  userId: string;
  recipientName: string;
}

export const EnhancedCampaignDisplay: React.FC<EnhancedCampaignDisplayProps> = ({ 
  userId,
  recipientName
}) => {
  const { campaign, totalAmount, loading } = useCampaignData(userId);
  const firstName = recipientName.split(' ')[0];

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

  const percentage = campaign.target_amount > 0 
    ? Math.min(Math.round((totalAmount / campaign.target_amount) * 100), 100) 
    : 0;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <EnhancedCampaignHero 
        title={campaign.title}
        imageUrl={campaign.image_url}
        recipientName={recipientName}
      />
      
      <div className="px-6 py-8">
        <EnhancedCampaignProgress 
          targetAmount={campaign.target_amount}
          currentAmount={totalAmount}
          percentage={percentage}
          endDate={campaign.end_date}
        />
        
        <EnhancedCampaignStory description={campaign.description} />
        
        <div className="mt-10 bg-gray-50 p-6 rounded-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-primary mb-2">
              <HandHeart className="w-5 h-5" />
              <span className="font-medium">Support {firstName}'s Campaign</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Donate Today
            </h3>
            <p className="mt-2 text-gray-600">
              Your generous donation will help reach the target of £{(campaign.target_amount / 100).toLocaleString()}
            </p>
          </div>
          
          <PaymentForm 
            recipientId={userId} 
            recipientName={recipientName}
          />
        </div>
      </div>
    </div>
  );
};
