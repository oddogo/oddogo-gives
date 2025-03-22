
import React from "react";

interface CampaignHeroImageProps {
  imageUrl: string | null | undefined;
}

export const CampaignHeroImage: React.FC<CampaignHeroImageProps> = ({
  imageUrl
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80";
  
  return (
    <div className="md:col-span-2 h-[400px] md:h-[500px]">
      <div className="h-full">
        <img 
          src={imageUrl || defaultImage}
          alt="Campaign Hero"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 md:hidden"></div>
    </div>
  );
};
