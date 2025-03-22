
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Campaign</h3>
      
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-line text-gray-700 leading-relaxed">
          {displayText}
        </p>
        
        {isTooLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center gap-2 text-teal-600 font-medium hover:underline focus:outline-none transition-colors duration-200 group"
          >
            {isExpanded ? (
              <>
                <span>Read less</span>
                <ChevronUp className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
