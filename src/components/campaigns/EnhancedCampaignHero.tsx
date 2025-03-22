
import React from "react";

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
    <div className="relative">
      <div className="h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={imageUrl || defaultImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/90 text-white text-sm font-medium mb-2">
          {firstName}'s Campaign
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
      </div>
    </div>
  );
};
