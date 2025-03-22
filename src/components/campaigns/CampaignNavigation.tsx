
import React from "react";
import { Logo } from "@/components/Logo";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CampaignNavigationProps {
  navigationItems: NavigationItem[];
}

export const CampaignNavigation: React.FC<CampaignNavigationProps> = ({ 
  navigationItems 
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
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
  );
};
