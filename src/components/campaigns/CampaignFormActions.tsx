
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Campaign } from "@/types/campaign";

interface CampaignFormActionsProps {
  isSubmitting: boolean;
  campaign?: Campaign;
}

export const CampaignFormActions: React.FC<CampaignFormActionsProps> = ({ 
  isSubmitting,
  campaign
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {campaign ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          campaign ? 'Update Campaign' : 'Create Campaign'
        )}
      </Button>
    </div>
  );
};
