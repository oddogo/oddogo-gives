
import React from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Heart, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
      
      {/* Hero section with grid layout */}
      <div className="relative bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hero Image - 2/3 width on desktop */}
            <div className="md:col-span-2 h-56 md:h-72 overflow-hidden">
              <img 
                src={imageUrl || defaultImage}
                alt="Campaign Hero"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 md:hidden"></div>
            </div>
            
            {/* Progress Section - 1/3 width on desktop */}
            <div className="md:col-span-1 flex flex-col justify-center p-6 bg-gray-50 shadow-inner">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Campaign Progress</h3>
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{formatCurrency(currentAmount)}</span>
                    <span className="font-medium">{formatCurrency(targetAmount)}</span>
                  </div>
                  <Progress value={percentage} className="h-2.5 bg-gray-200" />
                  <p className="text-sm text-teal-700 font-semibold">{percentage}% Complete</p>
                </div>
                
                {/* Stats cards in a 2-column grid */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users size={16} className="text-teal-600" />
                      <p className="text-sm font-semibold text-gray-900">{donorsCount} Supporters</p>
                    </div>
                  </div>
                  
                  {daysRemaining !== null && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar size={16} className="text-teal-600" />
                        <p className="text-sm font-semibold text-gray-900">
                          {daysRemaining > 0 
                            ? `${daysRemaining} days left` 
                            : 'Campaign ended'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Support button */}
                <Button 
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 shadow-md"
                  onClick={() => scrollToSection("donate-section")}
                >
                  Support {recipientName.split(' ')[0]}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaign Title Section - Moved below hero image */}
      <div className="text-center py-8 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center gap-2 mb-3">
            <div className="bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100 flex items-center gap-2">
              <Heart size={16} className="text-teal-600 fill-teal-600" />
              <span className="text-sm font-medium text-teal-700">{recipientName.split(' ')[0]}'s Campaign</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Help Support {recipientName}</h1>
        </div>
      </div>
    </div>
  );
};
