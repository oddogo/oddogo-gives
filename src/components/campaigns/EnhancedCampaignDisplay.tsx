
import React from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { EnhancedCampaignHero } from "./EnhancedCampaignHero";
import { EnhancedCampaignProgress } from "./EnhancedCampaignProgress";
import { EnhancedCampaignStory } from "./EnhancedCampaignStory";
import { PaymentForm } from "@/components/PaymentForm";
import { HeartHandshake } from "lucide-react";

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
        <div className="h-64 bg-gray-200 rounded-t-xl mb-4"></div>
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
    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg">
      <EnhancedCampaignHero 
        title={campaign.title}
        imageUrl={campaign.image_url}
        recipientName={recipientName}
      />
      
      <div className="px-4 py-6 sm:px-6 md:px-8">
        <EnhancedCampaignProgress 
          targetAmount={campaign.target_amount}
          currentAmount={totalAmount}
          percentage={percentage}
          endDate={campaign.end_date}
        />
        
        <EnhancedCampaignStory description={campaign.description} />
        
        <div className="mt-8 bg-gradient-to-br from-pastel-blue/50 to-pastel-purple/30 p-6 rounded-xl shadow-sm border border-pastel-purple/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-3">
              <HeartHandshake className="w-5 h-5" />
              <span className="font-medium">Support {firstName}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Donate Today
            </h3>
            <p className="mt-2 text-gray-600 max-w-lg mx-auto">
              Your contribution will help reach the goal of £{(campaign.target_amount / 100).toLocaleString()} and make a real difference
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
