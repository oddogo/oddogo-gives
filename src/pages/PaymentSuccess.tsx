
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const recipient_id = searchParams.get("recipient_id");
  const campaign_id = searchParams.get("campaign_id");

  const handleReturnClick = () => {
    if (campaign_id) {
      navigate(`/campaigns/${campaign_id}`);
    } else if (recipient_id) {
      navigate(`/profile/${recipient_id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Payment Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your donation. Your payment is being processed.
          </p>
          <Button onClick={handleReturnClick}>
            {campaign_id 
              ? "Return to Campaign" 
              : recipient_id 
                ? "Return to Profile" 
                : "Return Home"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
