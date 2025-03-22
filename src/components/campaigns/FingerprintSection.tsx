
import React from "react";
import { AllocationsSection } from "@/components/AllocationsSection";
import { Allocation } from "@/types/allocation";

interface FingerprintSectionProps {
  allocations: Allocation[];
  firstName: string;
}

export const FingerprintSection: React.FC<FingerprintSectionProps> = ({
  allocations,
  firstName
}) => {
  return (
    <div id="fingerprint" className="mb-16 mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{firstName}'s Fingerprint</h2>
        <p className="text-gray-600 mt-2">See how {firstName}'s donations will be allocated across charities and causes</p>
      </div>
      <AllocationsSection 
        allocations={allocations} 
        firstName={firstName} 
      />
    </div>
  );
};
