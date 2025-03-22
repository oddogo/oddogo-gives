
import React from "react";
import { Users, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignProgressDisplayProps {
  currentAmount: number;
  percentage: number;
  donorsCount: number;
  recipientName: string;
  onSupportClick?: () => void;
}

export const CampaignProgressDisplay: React.FC<CampaignProgressDisplayProps> = ({
  currentAmount,
  percentage,
  donorsCount,
  recipientName,
  onSupportClick
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="md:col-span-1 flex flex-col justify-center p-6 bg-gray-50 shadow-inner">
      <div className="space-y-6">
        {/* Progress chart - increased size */}
        <div className="relative flex justify-center items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-gray-200 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              
              {/* Progress circle */}
              <circle
                className="text-teal-600 stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                transform="rotate(-90 50 50)"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-teal-700">{percentage}%</span>
            </div>
          </div>
        </div>
        
        {/* Amount raised and supporters count - larger text */}
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentAmount)}</p>
          <p className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
            <Users size={16} />
            <span>{donorsCount} {donorsCount === 1 ? 'Supporter' : 'Supporters'}</span>
          </p>
        </div>
        
        {/* Support button - now uses the onSupportClick prop */}
        <Button 
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 shadow-md"
          onClick={onSupportClick}
        >
          Support {recipientName.split(' ')[0]}
        </Button>
        
        {/* Share button */}
        <Button 
          variant="outline"
          className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
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
          <Share2 size={16} className="mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
};
