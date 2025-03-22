
import React, { useState } from "react";

interface EnhancedCampaignStoryProps {
  description?: string | null;
}

export const EnhancedCampaignStory: React.FC<EnhancedCampaignStoryProps> = ({
  description
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!description) return null;
  
  const MAX_LENGTH = 300;
  const isTooLong = description.length > MAX_LENGTH;
  const displayText = isExpanded || !isTooLong 
    ? description 
    : description.substring(0, MAX_LENGTH) + '...';

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Story</h2>
      
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-line text-gray-700">
          {displayText}
        </p>
        
        {isTooLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary font-medium mt-2 hover:underline focus:outline-none"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
};
