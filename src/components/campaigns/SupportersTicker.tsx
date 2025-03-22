
import React, { useEffect, useRef } from "react";
import { User, Clock } from "lucide-react";

interface Supporter {
  name: string;
  amount: number;
  timeAgo: string;
  message?: string;
}

interface SupportersTickerProps {
  supporters: Supporter[];
}

export const SupportersTicker: React.FC<SupportersTickerProps> = ({ supporters }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    
    // Auto-scroll animation
    const scrollElement = scrollRef.current;
    let scrollPosition = 0;
    
    const scroll = () => {
      if (!scrollElement) return;
      
      scrollPosition += 0.5;
      if (scrollPosition >= scrollElement.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollElement.scrollLeft = scrollPosition;
    };
    
    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (supporters.length === 0) return null;

  return (
    <div className="w-full bg-gray-50 py-3 overflow-hidden border-y border-gray-100">
      <div 
        ref={scrollRef} 
        className="flex items-center space-x-8 whitespace-nowrap overflow-x-hidden"
      >
        {/* Duplicate the supporters to ensure continuous scrolling */}
        {[...supporters, ...supporters].map((supporter, index) => (
          <div 
            key={index}
            className="inline-flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <User size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{supporter.name}</span>
                <span className="font-bold text-teal-600">{formatCurrency(supporter.amount)}</span>
              </div>
              {supporter.message && (
                <p className="text-sm text-gray-500 italic">"{supporter.message}"</p>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-400 gap-1">
              <Clock size={12} />
              <span>{supporter.timeAgo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
