import React, { useState } from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { EnhancedCampaignHero } from "./EnhancedCampaignHero";
import { SupportersTicker } from "./SupportersTicker";
import { CampaignLayout } from "./CampaignLayout";
import { FingerprintSection } from "./FingerprintSection";
import { RegisterInterestSection } from "./RegisterInterestSection";
import { HeartHandshake, Heart, List, Award, History } from "lucide-react";
import { differenceInDays } from "date-fns";

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
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const navigationItems = [
    { name: "Campaign", icon: <Award className="w-4 h-4" />, id: "campaign" },
    { name: `${firstName}'s Fingerprint`, icon: <List className="w-4 h-4" />, id: "fingerprint" },
    { name: "About", icon: <Heart className="w-4 h-4" />, id: "about" },
    { name: "Donation History", icon: <History className="w-4 h-4" />, id: "payment-history" }
  ];

  if (loading) {
    return (
      <div className="text-center px-4 sm:px-0 animate-pulse">
        <div className="h-64 bg-gray-200 mb-4"></div>
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
    
  // Calculate days remaining if end date exists
  const daysRemaining = campaign.end_date 
    ? Math.max(0, differenceInDays(new Date(campaign.end_date), new Date())) 
    : null;
  
  // Mock data for demonstration (in a real app, these would come from the backend)
  const donorsCount = Math.floor(totalAmount / 2500) + 1; // Just a mock formula

  // Handler to open the donation dialog
  const handleSupportClick = () => {
    setIsDonationOpen(true);
  };

  // Mock recent supporters for the ticker
  const recentSupporters = [
    { name: "Anonymous", amount: 5000, timeAgo: "5 minutes ago", message: "Keep up the great work!" },
    { name: "Sarah M.", amount: 2500, timeAgo: "20 minutes ago" },
    { name: "Michael T.", amount: 10000, timeAgo: "1 hour ago", message: "Happy to support this cause" },
    { name: "Anonymous", amount: 1500, timeAgo: "3 hours ago" },
    { name: "Jamie W.", amount: 7500, timeAgo: "5 hours ago", message: "This is so important" }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Inject ID for the donate section to allow smooth scrolling */}
      <div id="donate-section" className="invisible"></div>
      
      <EnhancedCampaignHero 
        imageUrl={campaign.image_url}
        recipientName={recipientName}
        navigationItems={navigationItems}
        targetAmount={campaign.target_amount}
        currentAmount={totalAmount}
        percentage={percentage}
        daysRemaining={daysRemaining}
        donorsCount={donorsCount}
        campaignTitle={campaign.title}
        onSupportClick={handleSupportClick}
      />
      
      {/* Recent Supporters Ticker */}
      <SupportersTicker supporters={recentSupporters} />
      
      {/* Campaign Section - Full width for consistency with hero section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div id="campaign" className="w-full mx-auto">
          <CampaignLayout 
            campaign={campaign}
            userId={userId}
            recipientName={recipientName}
            firstName={firstName}
            allocations={allocations}
            isDonationOpen={isDonationOpen}
            setIsDonationOpen={setIsDonationOpen}
          />
        </div>
        
        {/* Allocations Section - Renamed to "FirstName's Fingerprint" */}
        <FingerprintSection 
          allocations={allocations}
          firstName={firstName}
        />
        
        {/* About Section */}
        <div id="about" className="mb-16">
          {/* This section's content would come from the profile information */}
        </div>
        
        {/* Payment History */}
        <div id="payment-history" className="mb-16">
          {/* This section's content would come from PaymentHistory component */}
        </div>
        
        {/* Register Interest Section */}
        <RegisterInterestSection
          isOpen={isInterestOpen}
          onOpenChange={setIsInterestOpen}
        />
      </div>
    </div>
  );
};
