
import React from "react";

interface PaymentFooterProps {
  recipientName: string;
  hasCampaign: boolean;
}

export const PaymentFooter: React.FC<PaymentFooterProps> = ({ 
  recipientName, 
  hasCampaign 
}) => {
  return (
    <p className="text-xs text-center text-gray-500 mt-4">
      Your donation will be processed securely via Stripe.
      <br />
      All payments support {recipientName}&apos;s giving fingerprint.
      {hasCampaign && <br />Your donation will be linked to this campaign.}
    </p>
  );
};
