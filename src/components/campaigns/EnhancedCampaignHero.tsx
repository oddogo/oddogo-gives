
import React from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

interface EnhancedCampaignHeroProps {
  imageUrl?: string | null;
  recipientName: string;
  navigationItems: Array<{id: string, name: string, icon: React.ReactNode}>;
}

export const EnhancedCampaignHero: React.FC<EnhancedCampaignHeroProps> = ({
  imageUrl,
  recipientName,
  navigationItems
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80";
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Dark Teal Fixed Navigation Header - Using the same color as ProfileHero */}
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
      
      <div className="h-56 md:h-72 w-full overflow-hidden">
        <img 
          src={imageUrl || defaultImage}
          alt="Campaign Hero"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
      </div>
    </div>
  );
};
