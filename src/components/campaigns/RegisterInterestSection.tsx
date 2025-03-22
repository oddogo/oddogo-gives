
import React from "react";
import { Mail } from "lucide-react";
import { RegisterInterestForm } from "@/components/RegisterInterestForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface RegisterInterestSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterInterestSection: React.FC<RegisterInterestSectionProps> = ({
  isOpen,
  onOpenChange
}) => {
  return (
    <div className="my-16 bg-white shadow-sm overflow-hidden rounded-lg">
      <Collapsible
        open={isOpen}
        onOpenChange={onOpenChange}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button 
            className="w-full flex items-center justify-center gap-2 py-6 bg-teal-700 hover:bg-teal-800"
          >
            <Mail className="h-5 w-5" />
            <span>{isOpen ? "Close Form" : "Register Interest in Oddogo"}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Get Early Access</h2>
            <p className="mb-6 text-gray-600">
              Join our waitlist to be one of the first to experience Oddogo when we launch.
            </p>
            <RegisterInterestForm initialType="Donor" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
