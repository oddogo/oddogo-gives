
import React from "react";
import { Allocation } from "@/types/allocation";
import { PieChart, Building2, Image, Compass } from "lucide-react";

interface CompactFingerprintListProps {
  allocations: Allocation[];
  firstName: string;
}

export const CompactFingerprintList: React.FC<CompactFingerprintListProps> = ({ 
  allocations,
  firstName
}) => {
  // Get icon based on allocation type
  const getAllocationIcon = (type: string) => {
    switch (type) {
      case 'Charity':
        return <Building2 size={16} className="text-teal-600" />;
      case 'Region':
        return <Compass size={16} className="text-amber-600" />;
      default:
        return <Image size={16} className="text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <PieChart size={20} className="text-teal-600" />
        <h3 className="text-base font-medium text-gray-700">{firstName}'s Fingerprint</h3>
      </div>
      
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
        {allocations.map((allocation, index) => (
          <div 
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2">
              {getAllocationIcon(allocation.allocation_type)}
              <span className="text-sm text-gray-700 truncate max-w-[180px]">
                {allocation.allocation_name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {(allocation.allocation_percentage * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
