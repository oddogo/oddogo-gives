
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const session_id = searchParams.get("session_id");
  const recipient_id = searchParams.get("recipient_id");

  useEffect(() => {
    if (!session_id) {
      toast.error("Invalid payment session");
      navigate('/');
    }
  }, [session_id, navigate]);

  const handleReturnClick = () => {
    if (recipient_id) {
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
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for your donation. Your support makes a real difference.
          </p>
          <Button onClick={handleReturnClick}>
            Return to Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

