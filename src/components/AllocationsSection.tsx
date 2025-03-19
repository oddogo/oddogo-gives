
import { useState } from 'react';
import { DashboardChart } from "@/components/DashboardChart";
import { AllocationTable } from "@/components/AllocationTable";
import type { Allocation } from "@/types/allocation";
import { Button } from "@/components/ui/button";
import { HandHeart } from "lucide-react";

interface AllocationsSectionProps {
  allocations: Allocation[];
  firstName?: string;
}

export const AllocationsSection = ({ allocations, firstName = 'My' }: AllocationsSectionProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scrollToDonateSection = () => {
    const donateSection = document.getElementById('donate-section');
    if (donateSection) {
      donateSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="w-full bg-[#1A1F2C] py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-manrope text-center text-white mb-2">
            {firstName}'s Charity Fingerprint
          </h2>
        </div>
      </div>
      
      <div className="w-full bg-[#1A1F2C] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
            <div className="w-full md:col-span-4 flex flex-col">
              <div className="aspect-square relative w-full bg-white/5 rounded-lg backdrop-blur-sm p-4 border border-white/10 mb-4">
                <DashboardChart 
                  data={allocations} 
                  hoveredIndex={hoveredIndex}
                  onHoverChange={setHoveredIndex}
                />
              </div>
              <Button 
                onClick={scrollToDonateSection}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 text-lg rounded-full shadow-lg transform transition-all hover:scale-105 animate-pulse flex items-center gap-2 justify-center mt-2"
              >
                <HandHeart className="w-6 h-6" />
                Donate Now
              </Button>
            </div>
            <div className="w-full md:col-span-8">
              <div className="bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <AllocationTable 
                  data={allocations} 
                  hoveredIndex={hoveredIndex}
                  onHoverChange={setHoveredIndex}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
