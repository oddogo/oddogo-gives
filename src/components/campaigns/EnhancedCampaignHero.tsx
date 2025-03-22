
import React from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Heart, Calendar, Users, Share2, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EnhancedCampaignHeroProps {
  imageUrl?: string | null;
  recipientName: string;
  navigationItems: Array<{id: string, name: string, icon: React.ReactNode}>;
  targetAmount?: number;
  currentAmount?: number;
  percentage?: number;
  daysRemaining?: number | null;
  donorsCount?: number;
}

export const EnhancedCampaignHero: React.FC<EnhancedCampaignHeroProps> = ({
  imageUrl,
  recipientName,
  navigationItems,
  targetAmount = 0,
  currentAmount = 0,
  percentage = 0,
  daysRemaining = null,
  donorsCount = 0
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80";
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Dark Teal Fixed Navigation Header */}
      <div className="bg-gradient-to-b from-teal-950 to-teal-900 text-white py-3 px-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-40">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center space-x-1 px-3 py-1 hover:bg-teal-800 transition-colors"
              >
                <span className="hidden sm:inline">{item.name}</span>
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Added spacing below navigation */}
      <div className="pt-6"></div>
      
      {/* Campaign badges moved outside the hero container */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex justify-between items-center">
        <div className="bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 flex items-center gap-2">
          <Heart size={16} className="text-teal-600 fill-teal-600" />
          <span className="text-sm font-medium text-teal-700">{recipientName.split(' ')[0]}'s Campaign</span>
        </div>
        
        {daysRemaining !== null && (
          <div className="flex items-center gap-1.5 text-sm bg-gray-100 px-3 py-1 rounded-full">
            <Calendar size={14} className="text-teal-600" />
            <span className="font-medium text-gray-700">
              {daysRemaining > 0 
                ? `${daysRemaining} days left` 
                : 'Campaign ended'}
            </span>
          </div>
        )}
      </div>
      
      {/* Hero section with grid layout in a bordered container with teal border */}
      <div className="relative bg-white max-w-6xl mx-auto rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-teal-500 to-teal-700"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hero Image - 2/3 width on desktop, full height */}
          <div className="md:col-span-2 h-full">
            <div className="h-full">
              <img 
                src={imageUrl || defaultImage}
                alt="Campaign Hero"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                style={{ minHeight: "300px" }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 md:hidden"></div>
          </div>
          
          {/* Progress Section - 1/3 width on desktop */}
          <div className="md:col-span-1 flex flex-col justify-center p-6 bg-gray-50 shadow-inner">
            <div className="space-y-5">
              {/* Progress chart */}
              <div className="relative flex justify-center items-center">
                <div className="relative w-28 h-28">
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
                    <span className="text-2xl font-bold text-teal-700">{percentage}%</span>
                  </div>
                </div>
              </div>
              
              {/* Amount raised and supporters count */}
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-gray-900">{formatCurrency(currentAmount)}</p>
                <p className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
                  <Users size={14} />
                  <span>{donorsCount} {donorsCount === 1 ? 'Supporter' : 'Supporters'}</span>
                </p>
              </div>
              
              {/* Support button */}
              <Button 
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 shadow-md"
                onClick={() => scrollToSection("donate-section")}
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
        </div>
      </div>
      
      {/* Campaign Title Section - Moved below hero image */}
      <div className="text-center py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Help Support {recipientName}</h1>
        </div>
      </div>
    </div>
  );
};
