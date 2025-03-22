
import React, { useState } from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { EnhancedCampaignHero } from "./EnhancedCampaignHero";
import { EnhancedCampaignProgress } from "./EnhancedCampaignProgress";
import { EnhancedCampaignStory } from "./EnhancedCampaignStory";
import { PaymentForm } from "@/components/PaymentForm";
import { HeartHandshake, Heart, List, Award, History, Mail } from "lucide-react";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface EnhancedCampaignDisplayProps {
  userId: string;
  recipientName: string;
  allocations: any[];
}

export const EnhancedCampaignDisplay: React.FC<EnhancedCampaignDisplayProps> = ({ 
  userId,
  recipientName,
  allocations
}) => {
  const { campaign, totalAmount, loading } = useCampaignData(userId);
  const firstName = recipientName.split(' ')[0];
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  const navigationItems = [
    { name: "Campaign", icon: <Award className="w-4 h-4" />, id: "campaign" },
    { name: "Allocations", icon: <List className="w-4 h-4" />, id: "allocations" },
    { name: "About", icon: <Heart className="w-4 h-4" />, id: "about" },
    { name: "Donation History", icon: <History className="w-4 h-4" />, id: "payment-history" }
  ];

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
    <div className="bg-gray-50 min-h-screen">
      <EnhancedCampaignHero 
        title={campaign.title}
        imageUrl={campaign.image_url}
        recipientName={recipientName}
        navigationItems={navigationItems}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Campaign Section */}
        <div id="campaign" className="mb-8">
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
        
        {/* Allocations Section */}
        <div id="allocations" className="mb-8">
          {allocations.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <List size={20} className="text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Giving Allocations</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">
                  See how {firstName} allocates their charitable giving across different causes.
                </p>
                {/* We'll render the allocations here, but that content already exists in AllocationsSection */}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No allocations found for this profile.
            </div>
          )}
        </div>
        
        {/* About Section */}
        <div id="about" className="mb-8">
          {/* This section's content would come from the profile information */}
        </div>
        
        {/* Payment History */}
        <div id="payment-history" className="mb-8">
          {/* This section's content would come from PaymentHistory component */}
        </div>
        
        {/* Register Interest Section */}
        <div className="my-16 bg-white rounded-lg shadow-sm overflow-hidden">
          <Collapsible
            open={isInterestOpen}
            onOpenChange={setIsInterestOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button 
                className="w-full flex items-center justify-center gap-2 py-6 rounded-none bg-teal-600 hover:bg-teal-700"
              >
                <Mail className="h-5 w-5" />
                <span>{isInterestOpen ? "Close Form" : "Register Interest in Oddogo"}</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-6">
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Get Early Access</h2>
                <p className="mb-6 text-gray-600">
                  Join our waitlist to be one of the first to experience Oddogo when we launch.
                </p>
                <RegisterInterestForm initialType="Donor" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};
