
import React from "react";
import { Heart } from "lucide-react";

interface EnhancedCampaignHeroProps {
  title: string;
  imageUrl?: string | null;
  recipientName: string;
}

export const EnhancedCampaignHero: React.FC<EnhancedCampaignHeroProps> = ({
  title,
  imageUrl,
  recipientName
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80";
  
  const firstName = recipientName.split(' ')[0];

  return (
    <div className="relative rounded-t-xl overflow-hidden">
      <div className="h-72 md:h-96 w-full overflow-hidden">
        <img 
          src={imageUrl || defaultImage}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-2">
            <Heart size={16} className="text-primary fill-primary" />
            <span className="text-sm font-medium">{firstName}'s Campaign</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">{title}</h1>
      </div>
    </div>
  );
};
