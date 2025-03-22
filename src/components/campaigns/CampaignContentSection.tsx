
import React from "react";
import { EnhancedCampaignStory } from "./EnhancedCampaignStory";
import { HeartHandshake, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/PaymentForm";

interface CampaignContentSectionProps {
  campaign: any;
  userId: string;
  recipientName: string;
  firstName: string;
  isDonationOpen: boolean;
  setIsDonationOpen: (open: boolean) => void;
}

export const CampaignContentSection: React.FC<CampaignContentSectionProps> = ({
  campaign,
  userId,
  recipientName,
  firstName,
  isDonationOpen,
  setIsDonationOpen
}) => {
  return (
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
  );
};
