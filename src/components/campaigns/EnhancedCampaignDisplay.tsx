import React, { useState } from "react";
import { useCampaignData } from "@/hooks/useCampaignData";
import { EnhancedCampaignHero } from "./EnhancedCampaignHero";
import { EnhancedCampaignStory } from "./EnhancedCampaignStory";
import { PaymentForm } from "@/components/PaymentForm";
import { HeartHandshake, Heart, List, Award, History, Mail, Users, Share2 } from "lucide-react";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { AllocationsSection } from "@/components/AllocationsSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      
      {/* Campaign Section - 80% width with two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div id="campaign" className="w-4/5 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content area - 2/3 width */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
                <div className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">About This Campaign</h2>
                  </div>
                  
                  <EnhancedCampaignStory description={campaign.description} />
                  
                  <div className="mt-8 flex justify-center gap-4">
                    <Dialog open={isDonationOpen} onOpenChange={setIsDonationOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center gap-2"
                        >
                          <HeartHandshake className="w-5 h-5" />
                          <span>Support {firstName}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-center mb-2">
                            Support {firstName}'s Campaign
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <PaymentForm 
                            recipientId={userId} 
                            recipientName={recipientName}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline"
                      className="border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Help Support ${recipientName}`,
                            text: `Check out ${recipientName}'s fundraising campaign`,
                            url: window.location.href,
                          }).catch(err => console.error('Error sharing:', err));
                        } else {
                          // Fallback for browsers that don't support navigator.share
                          navigator.clipboard.writeText(window.location.href)
                            .then(() => alert('Link copied to clipboard!'))
                            .catch(err => console.error('Error copying link:', err));
                        }
                      }}
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share Campaign</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar - 1/3 width */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Supporters section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Supporters</h3>
                      <div className="space-y-3">
                        {/* Mock supporters - In a real app, these would come from the database */}
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">Anonymous Supporter</p>
                              <p className="text-xs text-gray-500">{(donorsCount - i) * 100} minutes ago</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Campaign organizer */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Organizer</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                          {recipientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{recipientName}</p>
                          <Button variant="link" className="p-0 h-auto text-sm text-teal-600">
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Allocations Section - Renamed to "FirstName's Fingerprint" */}
        <div id="fingerprint" className="mb-16 mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{firstName}'s Fingerprint</h2>
            <p className="text-gray-600 mt-2">See how {firstName}'s donations will be allocated across charities and causes</p>
          </div>
          <AllocationsSection 
            allocations={allocations} 
            firstName={firstName} 
          />
        </div>
        
        {/* About Section */}
        <div id="about" className="mb-16">
          {/* This section's content would come from the profile information */}
        </div>
        
        {/* Payment History */}
        <div id="payment-history" className="mb-16">
          {/* This section's content would come from PaymentHistory component */}
        </div>
        
        {/* Register Interest Section */}
        <div className="my-16 bg-white shadow-sm overflow-hidden rounded-lg">
          <Collapsible
            open={isInterestOpen}
            onOpenChange={setIsInterestOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button 
                className="w-full flex items-center justify-center gap-2 py-6 bg-teal-700 hover:bg-teal-800"
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
