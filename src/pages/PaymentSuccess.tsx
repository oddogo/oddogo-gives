
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, Home } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("payment_id");
  const campaignId = searchParams.get("campaign_id");
  const recipientId = searchParams.get("recipient_id");
  
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "completed" | "processing" | "failed">("loading");
  const [paymentDetails, setPaymentDetails] = useState<any | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      console.error("No payment ID found in URL");
      setErrorMessage("No payment ID was found in the URL. Please contact support if this issue persists.");
      setPaymentStatus("failed");
      toast.error("Payment verification failed: Missing payment ID");
      return;
    }
    
    console.log(`Checking payment status for ID: ${paymentId}`);
    
    const checkPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("stripe_payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (error) {
          console.error("Error fetching payment status:", error);
          if (pollingCount > 10) { // Stop after ~20 seconds
            setErrorMessage(`Unable to verify payment status: ${error.message}`);
            setPaymentStatus("failed");
            toast.error("Payment verification failed. Please contact support.");
          }
          return;
        }

        console.log("Payment data:", data);
        setPaymentDetails(data);
        
        if (data.status === "completed") {
          setPaymentStatus("completed");
          toast.success("Payment completed successfully!");
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setErrorMessage("Payment processing failed. Please try again or contact support.");
          toast.error("Payment failed. Please contact support.");
        } else {
          // Still processing, keep polling
          setPaymentStatus("processing");
          
          if (pollingCount < 30) { // Cap polling at ~1 minute total
            setPollingCount(prev => prev + 1);
          } else {
            // After too many attempts, assume something went wrong with the webhook
            setPaymentStatus("failed");
            setErrorMessage("Payment verification timed out. The payment might still be processing. Please check your email for confirmation or contact support.");
            toast.error("Payment verification timed out. Please check your email for confirmation.");
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (pollingCount > 10) {
          setPaymentStatus("failed");
          setErrorMessage("An unexpected error occurred while verifying payment. Please contact support.");
        }
      }
    };

    checkPaymentStatus();
    
    // Poll every 2 seconds if payment is still processing
    const intervalId = setInterval(() => {
      if (paymentStatus === "loading" || paymentStatus === "processing") {
        checkPaymentStatus();
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [paymentId, paymentStatus, pollingCount]);

  // Handle manual redirect to home if needed
  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          {paymentStatus === "loading" || paymentStatus === "processing" ? (
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          ) : paymentStatus === "completed" ? (
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-yellow-500" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">
            {paymentStatus === "loading" ? "Processing Your Donation..." :
             paymentStatus === "processing" ? "Processing Your Donation..." :
             paymentStatus === "completed" ? "Thank You For Your Donation!" :
             "Payment Verification Issue"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="space-y-4">
            {paymentStatus === "loading" || paymentStatus === "processing" ? (
              <p className="text-center text-gray-600">
                Please wait while we process your donation. This might take a few moments...
              </p>
            ) : paymentStatus === "completed" ? (
              <div className="space-y-2">
                <p className="text-center text-gray-600">
                  Your donation was successful! Thank you for your generosity and support.
                </p>
                {paymentDetails && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount:</span>
                      <span className="font-semibold">£{paymentDetails.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-center text-gray-600">
                  {errorMessage || "We're still waiting to confirm your payment. You'll receive an email confirmation when completed."}
                </p>
                {paymentId && (
                  <p className="text-center text-sm text-gray-500">
                    Payment ID: {paymentId}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center space-x-4 pt-2">
          {paymentStatus === "completed" && campaignId && paymentDetails?.campaign_slug && (
            <Button asChild>
              <Link to={`/campaigns/${paymentDetails.campaign_slug}`}>
                View Campaign
              </Link>
            </Button>
          )}
          
          {paymentStatus === "completed" && recipientId && (
            <Button asChild>
              <Link to={`/profile/${recipientId}`}>
                View Profile
              </Link>
            </Button>
          )}
          
          <Button asChild variant={paymentStatus === "completed" ? "outline" : "default"}>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
