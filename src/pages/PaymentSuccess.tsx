
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const recipient_id = searchParams.get("recipient_id");
  const campaign_id = searchParams.get("campaign_id");

  useEffect(() => {
    // Check if there's a payment intent in the URL (Stripe redirects with this)
    const payment_intent = searchParams.get("payment_intent");
    const payment_intent_client_secret = searchParams.get("payment_intent_client_secret");
    
    const checkPaymentStatus = async () => {
      if (payment_intent) {
        try {
          // Look up the payment by payment intent ID
          const { data, error } = await supabase
            .from('stripe_payments')
            .select('status')
            .eq('stripe_payment_intent_id', payment_intent)
            .single();
          
          if (data && data.status === 'completed') {
            setPaymentCompleted(true);
          } else {
            // If payment is not completed yet, we'll just show the processing status
            console.log("Payment is still processing or failed");
          }
        } catch (err) {
          console.error("Error checking payment status:", err);
        }
      }
      
      setIsLoading(false);
    };
    
    checkPaymentStatus();
  }, [searchParams]);

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
            {isLoading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            {isLoading ? "Checking Payment Status..." : 
             paymentCompleted ? "Payment Successful" : "Payment Processing"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {isLoading ? "Please wait while we verify your payment..." : 
             paymentCompleted ? 
               "Thank you for your donation. Your payment has been completed successfully." : 
               "Thank you for your donation. Your payment is being processed and will be confirmed shortly."}
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
